import { ObservableVariable, oVar } from "observable-variable";

/**
 * 任务的日志记录
 */
export class TaskLogger {

    //保存的日志
    private readonly _logList: { date: number, is_error: boolean, text: string }[] = [];

    //日志最大长度改变回调
    private readonly _onLogMaxLengthChange = (maxLength: number) => {
        if (this._logList.length > maxLength)
            this._logList.splice(0, maxLength - this._logList.length);
    }

    /**
     * 当前任务的运行状态
     */
    readonly status: ObservableVariable<'running' | 'stop' | 'crashed'> = oVar('stop') as any;

    /**
     * 该任务是否是服务。服务的日志永远不会过期
     */
    isService: boolean = false;

    constructor(readonly taskFilePath: string, private readonly _logMaxLength: ObservableVariable<number>) {
        this._logMaxLength.on('set', this._onLogMaxLengthChange);
    }

    /**
     * 清理资源。LogManager 内部使用
     */
    _destroy(): void {
        this._logMaxLength.off('set', this._onLogMaxLengthChange);
    }

    /**
     * 添加一条新的日志
     * @param is_error 是否是 stderr 输出
     * @param text 日志内容
     */
    addLog(is_error: boolean, text: string): void {
        this._logList.push({ date: Date.now(), is_error, text });
        if (this._logList.length > this._logMaxLength.value)
            this._logList.shift();
    }

    /**
     * 清空日志
     */
    cleanLog(): void {
        this._logList.length = 0;
    }

    /**
     * 获取某个时间点之后的所有日志，如果不传入则表示获取所有日志
     * @param date 时间戳
     */
    getLogsAfterDate(date?: number): ReadonlyArray<{ date: number, is_error: boolean, text: string }> {
        if (date === undefined)
            return this._logList;
        else {
            const result = [];

            for (let i = this._logList.length - 1; i > -1; i--) {
                const element = this._logList[i];
                if (element.date > date)
                    result.push(element);
                else
                    break;
            }

            return result.reverse();
        }
    }

    /**
     * 从末尾获取多少条日志
     */
    getLogsFromEnd(size: number): ReadonlyArray<{ date: number, is_error: boolean, text: string }> {
        return this._logList.slice(-size);
    }

    /**
     * 获取最后一条日志的时间。如果没有日志则返回0
     */
    getLastLogDate(): number {
        if (this._logList.length > 0)
            return this._logList[this._logList.length - 1].date;
        else
            return 0;
    }
}