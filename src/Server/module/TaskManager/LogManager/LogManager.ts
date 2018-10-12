import * as moment from 'moment';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from "observable-variable";

import * as FilePath from '../../../FilePath';

import { SystemSetting } from "../../SystemSetting/SystemSetting";

import { TaskLogger } from './TaskLogger';

//设置系统变量默认值
SystemSetting.addSystemSetting('task.logMaxLength', 3000, false, 'number');     //日志最大保存数，默认3000条，最小值1
SystemSetting.addSystemSetting('task.logMaxSaveDays', 30, false, 'number');     //日志最大保存天数（任务处于停止状态，超过多少天没有更新过日志就会被删除），默认30天，最小值1。服务的日志不会受到这个的限制

/**
 * 用户任务日志管理器
 */
export class LogManager extends BaseServiceModule {

    private readonly _loggerList: Map<string, TaskLogger> = new Map();  //日志列表，key：任务文件路径
    private _cleanTimeoutLogs: any;                            //清理超过最大保存日期的日志

    private _logMaxLength: ObservableVariable<number>;
    private _logMaxSaveDays: ObservableVariable<number>;

    /**
     * 检查任务路径是否符合要求
     */
    static _checkPath(taskFilePath: string): void {
        if (!taskFilePath.startsWith(FilePath._userCodeDir))
            throw new Error(`不能为 '${FilePath._userCodeDir}' 目录以外的文件创建任务日志`);

        if (!taskFilePath.endsWith('.js'))
            throw new Error('只能为 js 类型的文件创建任务日志');
    }

    async onStart(): Promise<void> {
        const systemSetting = this.services.SystemSetting as SystemSetting;
        this._logMaxLength = systemSetting.normalSettings.get('task.logMaxLength') as any;
        this._logMaxSaveDays = systemSetting.normalSettings.get('task.logMaxSaveDays') as any;

        this._logMaxLength.on('beforeSet', newValue => {
            if (newValue < 1)
                throw new Error('task.logMaxLength 的值不可以小于 1');
        });

        this._logMaxSaveDays.on('beforeSet', newValue => {
            if (newValue < 1)
                throw new Error('task.logMaxSaveDays 的值不可以小于 1');
        });

        //每个24小时执行一次清理
        this._cleanTimeoutLogs = setInterval(() => {
            const timeLine = moment().subtract(this._logMaxSaveDays.value, 'd').valueOf();
            this._loggerList.forEach((logger, taskFilePath) => {
                if (logger.isService === false && logger.status.value !== 'running' && logger.getLastLogDate() < timeLine)
                    this.deleteTaskLogger(taskFilePath);
            });
        }, 1000 * 60 * 60 * 24);
    }

    async onStop(): Promise<void> {
        clearInterval(this._cleanTimeoutLogs);
    }

    /**
     * 为任务创建一个新的日志记录器。如果存在，则直接返回已经有的
     */
    createTaskLogger(taskFilePath: string): TaskLogger {
        LogManager._checkPath(taskFilePath);

        if (this._loggerList.has(taskFilePath))
            return this._loggerList.get(taskFilePath) as any;
        else {
            const logger = new TaskLogger(taskFilePath, this._logMaxLength);
            this._loggerList.set(taskFilePath, logger);
            return logger;
        }
    }

    /**
     * 删除某个任务的日志
     */
    deleteTaskLogger(taskFilePath: string): void {
        const logger = this._loggerList.get(taskFilePath);
        if (logger) {
            logger._destroy();
            this._loggerList.delete(taskFilePath);
        }
    }

    /**
     * 清空某个任务的日志
     */
    cleanTaskLogger(taskFilePath: string): void {
        const logger = this._loggerList.get(taskFilePath);
        if (logger) logger.cleanLog();
    }

    /**
     * 获取某个任务在某个时间点之后的所有日志，如果不传入日期则表示获取所有日志，如果任务不存在就直接返回空数组
     * @param date js 时间戳
     */
    getLogsAfterDate(taskFilePath: string, date?: number): ReadonlyArray<{ date: number, is_error: boolean, text: string }> {
        const logger = this._loggerList.get(taskFilePath);
        if (logger) {
            return logger.getLogsAfterDate(date);
        } else
            return [];
    }

    /**
     * 从末尾获取多少条日志，如果任务不存在就直接返回空数组
     */
    getLogsFromEnd(taskFilePath: string, size: number): ReadonlyArray<{ date: number, is_error: boolean, text: string }> {
        const logger = this._loggerList.get(taskFilePath);
        if (logger)
            return logger.getLogsFromEnd(size);
        else
            return [];
    }

    /**
     * 获取某个任务当前的运行状态，如果任务不存在就直接返回空
     */
    getTaskStatus(taskFilePath: string): 'running' | 'stop' | 'crashed' | undefined {
        const logger = this._loggerList.get(taskFilePath);
        if (logger) return logger.status.value;
    }

    /**
     * 获取所有任务的状态
     */
    getAllTaskStatus(): ReadonlyArray<{ path: string, status: string }> {
        const result: { path: string, status: string }[] = [];
        this._loggerList.forEach(item => result.push({ path: item.taskFilePath, status: item.status.value }));
        return result;
    }
}
