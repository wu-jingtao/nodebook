import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from "observable-variable";

import { SystemSetting } from "../SystemSetting/SystemSetting";

//设置系统变量默认值
SystemSetting.addSystemSetting('task.logMaxLength', 3000, true, false);     //日志最大保存数，默认3000条

/**
 * 用户任务日志管理器
 */
export class LogManager extends BaseServiceModule {

    private readonly _logs: Map<string, Logger> = new Map();
    private _logMaxLength: ObservableVariable<number>;

    async onStart(): Promise<void> {
        const systemSetting = this.services.SystemSetting as SystemSetting;
        this._logMaxLength = systemSetting.normalSettings.get('task.logMaxLength') as any;
    }

    /**
     * 为任务创建一个新的日志记录器。如果存在，则直接返回已经有的
     */
    addNewTaskLog(taskName: string): Logger {
        if (this._logs.has(taskName))
            return this._logs.get(taskName) as any;
        else {
            const log = new Logger(this._logMaxLength);
            this._logs.set(taskName, log);
            return log;
        }
    }

    /**
     * 删除某个任务的日志
     */
    deleteTaskLog(taskName: string): void {
        if (this._logs.has(taskName)) {
            const log = this._logs.get(taskName) as Logger;
            log.destroy();
            this._logs.delete(taskName);
        }
    }

    /**
     * 获取某个任务在某个时间点之后的所有日志，如果不传入日期则表示获取所有日志，如果任务不存在就直接返回空数组
     * @param date js 时间戳
     */
    getLogsAfterDate(taskName: string, date?: number): { date: number, is_error: boolean, text: string }[] {
        if (this._logs.has(taskName)) {
            const log = this._logs.get(taskName) as Logger;
            return log.getLogsAfterDate(date);
        } else
            return [];
    }
}

/**
 * 任务的日志记录器
 */
export class Logger {

    //保存的日志，
    private readonly _logList: { date: number, is_error: boolean, text: string }[] = [];

    private readonly _onLogMaxLengthChange = (maxLength: number) => {
        if (this._logList.length > maxLength)
            this._logList.splice(0, maxLength - this._logList.length);
    }

    constructor(private readonly _logMaxLength: ObservableVariable<number>) {
        this._logMaxLength.on('set', this._onLogMaxLengthChange);
    }

    /**
     * 清理资源
     */
    destroy(): void {
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
     * 获取某个时间点之后的所有日志，如果不传入则表示获取所有日志
     * @param date js 时间戳
     */
    getLogsAfterDate(date?: number): { date: number, is_error: boolean, text: string }[] {
        if (date === undefined)
            return this._logList;
        else {
            const result = [];

            for (let i = this._logList.length - 1; i > -1; i--) {
                const element = this._logList[i];
                if (element.date > date)
                    result.unshift(element);
                else
                    break;
            }

            return result;
        }
    }
}