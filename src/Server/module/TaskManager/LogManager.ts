import { BaseServiceModule } from "service-starter";

/**
 * 用户任务日志管理器
 */
export class LogManager extends BaseServiceModule {

    /**
     * 保存任务的日志
     */
    private readonly _logs: Map<string, Logger> = new Map();

    async onStart(): Promise<void> { }

    /**
     * 为任务创建一个新的日志记录器，如果存在，则直接返回已经存在的
     */
    addNewTaskLog(taskName: string): Logger {
        if (this._logs.has(taskName))
            return this._logs.get(taskName) as any;
        else {
            const log = new Logger(taskName);
            this._logs.set(taskName, log);
            return log;
        }
    }

    deleteTaskLog(taskName: string): void {
        this._logs.delete(taskName);
    }
}

/**
 * 任务的日志记录器
 */
export class Logger {
    constructor(readonly taskName: string) { }
}