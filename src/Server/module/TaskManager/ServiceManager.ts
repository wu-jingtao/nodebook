import { BaseServiceModule } from "service-starter";

/**
 * 用户服务管理器。服务是一种特殊的任务，主要区别在于它可以随系统重启，崩溃的时候可以给用户发送邮件通知
 */
export class ServiceManager extends BaseServiceModule{

    async onStart(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}