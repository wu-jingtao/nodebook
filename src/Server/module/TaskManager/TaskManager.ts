import { BaseServiceModule } from "service-starter";
import { LogManager } from "./LogManager/LogManager";

/**
 * 用户任务管理器
 */
export class TaskManager extends BaseServiceModule {

    //存放正在执行的任务。key：文件路径
    private readonly _taskList: Map<string, Task> = new Map();
    private _logManager: LogManager;

    async onStart(): Promise<void> {
        this._logManager = this.services.LogManager;
    }

    /**
     * 创建一个新的任务，
     */
    createTask(path: string) {

    }
}

/**
 * 代表一个任务
 */
export class Task {

}