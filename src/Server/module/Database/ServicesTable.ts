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
    private async _createTable() {
        await this._dbCon.exec(`
            CREATE TABLE IF NOT EXISTS "main"."services" (
                "name" TEXT NOT NULL,	            --服务名称
                "path" TEXT NOT NULL,	            --程序文件路径
                "auto_restart" integer NOT NULL,	--服务是否随服务器自动重启
                "report_error" integer NOT NULL,	--当服务崩溃时是否发送邮件通知用户
                PRIMARY KEY ("name")
            );
        `);
    }

    /**
     * 更新服务配置
     */
    async updateService(name: string, path: string, auto_restart: boolean, report_error: boolean) {
        await this._dbCon.run(`
            UPDATE "main"."services"
            SET "path" = ?, "auto_restart" = ?, "report_error" = ?
            WHERE "name" = ?
        `, path, auto_restart, report_error, name);
    }

    /**
     * 添加一条新的服务配置
     */
    async addService(name: string, path: string, auto_restart: boolean, report_error: boolean) {
        await this._dbCon.run(`
            INSERT INTO "main"."system_setting" ("name", "path", "auto_restart", "report_error")
            VALUES (?, ?, ?, ?)
        `, name, path, auto_restart, report_error);
    }

    /**
     * 删除一条服务配置
     */
    async deleteService(name: string) {
        await this._dbCon.run(`
            DELETE FROM "main"."services" WHERE "name" = ?
        `, name);
    }

    /**
     * 获取所有服务配置
     */
    async getAllServices(): Promise<{ name: string, path: string, auto_restart: boolean, report_error: boolean }[]> {
        return await this._dbCon.all(`
            SELECT "name", "path", "auto_restart", "report_error" FROM "main"."services" 
        `);
    }
}