import { BaseServiceModule } from "service-starter";

/**
 * 用户任务管理器
 */
export class TaskManager extends BaseServiceModule{

    async onStart(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}