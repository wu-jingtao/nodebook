import log from 'log-formatter';
import * as moment from 'moment';
import { BaseServiceModule } from "service-starter";

import { TaskManager } from "./TaskManager";
import { ServicesTable, ServiceConfig } from "../Database/ServicesTable";
import { LogManager } from "./LogManager/LogManager";
import { FileManager } from "../FileManager/FileManager";
import { TaskLogger } from './LogManager/TaskLogger';
import { MailService } from '../MailService/MailService';

/**
 * 用户服务管理器。服务是一种特殊的任务，主要区别在于它可以随系统重启，崩溃的时候可以给用户发送邮件通知
 */
export class ServiceManager extends BaseServiceModule {

    //用户配置的服务列表，key：任务文件路径。注意：Map 中 ServiceConfig 不能替换，因为有些地方会引用其中的值
    private readonly _servicesList: Map<string, ServiceConfig> = new Map();

    private _taskManager: TaskManager;
    private _logManager: LogManager;
    private _servicesTable: ServicesTable;
    private _mailService: MailService;

    async onStart(): Promise<void> {
        this._taskManager = this.services.TaskManager;
        this._logManager = this.services.LogManager;
        this._servicesTable = this.services.ServicesTable;
        this._mailService = this.services.MailService;

        for (const item of await this._servicesTable.getAllServices()) {
            this._servicesList.set(item.path, item);
            this._generateServiceLogger(item);
            if (item.auto_restart) {    //启动用户服务
                try {
                    this._taskManager.createTask(item.path);
                } catch (err) {
                    log.error.location.text.content.content(this.name, '启动用户服务失败', `服务名：${item.name}  服务文件：${item.path}`, err);
                }
            }
        }
    }

    /**
     * 生成服务 Logger
     */
    private _generateServiceLogger(serviceConfig: ServiceConfig) {
        const logger = this._logManager.createTaskLogger(serviceConfig.path);
        if (logger.isService === false) {
            logger.isService = true;
            logger.status.on('set', newValue => {
                if (serviceConfig.report_error && newValue === 'crashed') {
                    const content = `
                        NodeBook <${process.env.DOMAIN}>
                        崩溃时间：${moment().format('YYYY-MM-DD HH:mm:ss')}
                        服务名称：${serviceConfig.name}
                        程序文件路径：${serviceConfig.path.replace(FileManager._userCodeDir, '/')}

                        下面是一些日志的错误摘要：
                        ${logger.getLogsFromEnd(100).map(item => `[${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}]  ${item.text}`).join('\n')}
                    `;

                    this._mailService.sendMail(`NodeBook 服务'${serviceConfig.name}'崩溃`, content).catch(() => { });
                }
            });
        }
    }

    /**
     * 获取服务列表
     */
    getServicesList(): ReadonlyArray<ServiceConfig> {
        return [...this._servicesList.values()];
    }

    /**
     * 创建一个新的服务。注意：服务创建后不会自动启动运行，如果服务已存在，则不会有任何效果
     * @param path 要执行的文件路径
     * @param name 服务名称
     * @param auto_restart 是否自动随系统重启
     * @param report_error 是否崩溃时发送邮件报告错误
     */
    async createService(path: string, name: string, auto_restart: boolean, report_error: boolean): Promise<void> {
        if (!this._servicesList.has(path)) {
            if (!path.startsWith(FileManager._userCodeDir))
                throw new Error(`不能为 '${FileManager._userCodeDir}' 目录外的文件创建服务`);

            if (!path.endsWith('.js'))
                throw new Error('只能为 js 类型的文件创建服务');

            await this._servicesTable.addService(path, name, auto_restart, report_error);

            const serviceConfig: ServiceConfig = { path, name, auto_restart, report_error };
            this._servicesList.set(path, serviceConfig);
            this._generateServiceLogger(serviceConfig);
        }
    }

    /**
     * 更新某个服务的配置，如果服务不存在，则不会有任何效果
     */
    async updateService(path: string, name: string, auto_restart: boolean, report_error: boolean): Promise<void> {
        const serviceConfig = this._servicesList.get(path);
        if (serviceConfig) {
            await this._servicesTable.updateService(path, name, auto_restart, report_error);

            serviceConfig.name = name;
            serviceConfig.auto_restart = auto_restart;
            serviceConfig.report_error = report_error;
        }
    }

    /**
     * 删除某个服务，如果服务正在运行，则会被停止，任务日志也会自动被删除。如果服务不存在，则不会有任何效果
     */
    async deleteService(path: string): Promise<void> {
        if (this._servicesList.has(path)) {
            await this._servicesTable.deleteService(path);

            this._taskManager.destroyTask(path);
            this._logManager.deleteTaskLogger(path);
            this._servicesList.delete(path);
        }
    }
}