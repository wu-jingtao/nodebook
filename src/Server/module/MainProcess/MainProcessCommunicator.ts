import { BaseServiceModule } from "service-starter";

/**
 * 提供了一些帮助方法用于与主进程之间进行交互
 */
export class MainProcessCommunicator extends BaseServiceModule {

    /**
     * 是否开启了debug模式。
     */
    readonly isDebug = (process.env.DEBUG || '').toLowerCase() === 'true';

    /**
     * 系统启动时间
     */
    readonly systemUpTime = Date.now();

    /**
     * 本机的域名
     */
    domain = (process.env.DOMAIN || 'localhost').trim().toLowerCase().replace(/:443$/, ''); //去掉443是因为浏览器不会把443端口号发过来

    async onStart(): Promise<void> { }

    private _sendMessage(signal: string, bash?: string): void {
        (process as any).send({ signal, bash });
    }

    /**
     * 重启程序
     */
    restart(): void {
        this._sendMessage('restart');
    }

    /**
     * 重启服务并执行某些命令
     */
    restartAndRun(bash: string) {
        this._sendMessage('restartAndRun', bash);
    }
}