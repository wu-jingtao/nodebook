import sqlDB = require('simple-sqlite-promise');
import { BaseServiceModule } from "service-starter";

import { InitializeDatabase } from './InitializeDatabase';

/**
 * 服务表。提供了一些帮助方法便于数据库操作
 */
export class ServicesTable extends BaseServiceModule {

    private _dbCon: sqlDB;

    async onStart(): Promise<void> {
        this._dbCon = (this.services.InitializeDatabase as InitializeDatabase).dbCon;
        await this._createTable();
    }

    /**
     * 创建服务表
     */
    private async _createTable(): Promise<void> {
        await this._dbCon.exec(`
            CREATE TABLE IF NOT EXISTS "main"."services" (
                "path" TEXT NOT NULL,	            --程序文件路径
                "name" TEXT NOT NULL,	            --服务名称
                "auto_restart" integer NOT NULL,	--服务是否随服务器自动重启
                "report_error" integer NOT NULL,	--当服务崩溃时是否发送邮件通知用户
                PRIMARY KEY ("path")
            );
            CREATE UNIQUE INDEX IF NOT EXISTS "main"."services_name" ON "services" ("name");
        `);
    }

    /**
     * 更新服务配置
     */
    async updateService(path: string, name: string, auto_restart: boolean, report_error: boolean): Promise<void> {
        await this._dbCon.run(`
            UPDATE "main"."services"
            SET "name" = ?, "auto_restart" = ?, "report_error" = ?
            WHERE "path" = ?
        `, name, auto_restart, report_error, path);
    }

    /**
     * 添加一条新的服务配置
     */
    async addService(path: string, name: string, auto_restart: boolean, report_error: boolean): Promise<void> {
        await this._dbCon.run(`
            INSERT INTO "main"."services" ("path", "name", "auto_restart", "report_error")
            VALUES (?, ?, ?, ?)
        `, path, name, auto_restart, report_error);
    }

    /**
     * 删除一条服务配置
     */
    async deleteService(path: string): Promise<void> {
        await this._dbCon.run(`
            DELETE FROM "main"."services" WHERE "path" = ?
        `, path);
    }

    /**
     * 获取所有服务配置
     */
    async getAllServices(): Promise<ReadonlyArray<ServiceConfig>> {
        const result = await this._dbCon.all(`
            SELECT "path", "name", "auto_restart", "report_error" FROM "main"."services" 
        `);

        for (const item of result) {
            item.auto_restart = item.auto_restart == '1';
            item.report_error = item.report_error == '1';
        }

        return result;
    }
}

export type ServiceConfig = { path: string, name: string, auto_restart: boolean, report_error: boolean };