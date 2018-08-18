import * as _ from 'lodash';
import * as path from 'path';
import * as child_process from 'child_process';
import { BaseServiceModule, NodeServicesManager } from 'service-starter';

class NodeBook_MainProcess extends NodeServicesManager {
    constructor() {
        super();
        this.registerService(new SubprocessCommunicator);
    }
}

class SubprocessCommunicator extends BaseServiceModule {
    private _isDebug = (process.env.DEBUG || '').toLowerCase() === 'true';
    private _process: child_process.ChildProcess;
    private _process_onCloseCallback = () => this.servicesManager.stop();

    async onStart(): Promise<void> {
        if (this._isDebug)  //启动时就自动进入调试模式
            this._process = child_process.spawn('node', ['--inspect-brk=0.0.0.0:9229', path.resolve(__dirname, './ServiceStack.js')], { stdio: [0, 1, 2, 'ipc'] });
        else
            this._process = child_process.fork(path.resolve(__dirname, './ServiceStack.js'));

        this._process.on('close', this._process_onCloseCallback);
        this._process.on('message', (msg: { signal: string, args: any[] }) => {
            if (_.isObject(msg)) {
                switch (msg.signal) {
                    case 'restart': //重启服务
                        this._process.off('close', this._process_onCloseCallback);  //避免关闭主进程
                        this._process.on('close', () => this.onStart());
                        this._process.kill();
                        break;

                    case 'restartAndRun':   //重启服务并执行某些命令
                        this._process.off('close', this._process_onCloseCallback);  //避免关闭主进程
                        this._process.on('close', () => {
                            child_process.execSync(msg.args[0], { cwd: msg.args[1] });
                            this.onStart()
                        });
                        this._process.kill();
                        break;

                    default:
                        throw new Error('未定义消息类型：' + msg.signal);
                }
            } else
                throw new Error('子进程向主进程返回的消息不是一个有效的对象：' + JSON.stringify(msg));
        });
    }

    async onStop(): Promise<void> {
        this._process.kill();
    }
}

(new NodeBook_MainProcess).start();