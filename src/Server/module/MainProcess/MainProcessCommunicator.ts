import { BaseServiceModule } from "service-starter";

/**
 * 提供了一些帮助方法用于与主进程之间进行交互
 */
export class MainProcessCommunicator extends BaseServiceModule {

    async onStart(): Promise<void> { }

    private _sendMessage(signal: string, args: any[] = []): void {
        (process as any).send({ signal, args });
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
    restartAndRun(bash: string, cwd?: string) {
        this._sendMessage('restartAndRun', [bash, cwd]);
    }
}