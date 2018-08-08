import sqlDB = require('simple-sqlite-promise');
import { BaseServiceModule } from 'service-starter';

import { InitializeDatabase } from './InitializeDatabase';

/**
 * 系统设置表。提供了一些帮助方法便于数据库操作
 */
export class SystemSettingTable extends BaseServiceModule {

    /**
     * 系统默认值。顺序："key", "value", "is_server", "secret"
     */
    static readonly _defaultValue: Array<[string, any, boolean, boolean]> = [];

    private _dbCon: sqlDB;

    async onStart(): Promise<void> {
        this._dbCon = (this.services.InitializeDatabase as InitializeDatabase).dbCon;
        await this._createTable();
        await this._initializeDefaultValue();
    }

    /**
     * 创建系统设置表
     */
    private async _createTable() {
        await this._dbCon.run(`
            CREATE TABLE IF NOT EXISTS "main"."system_setting" (
                "key" TEXT NOT NULL,	        --键名，如果存在层级则通过'.'进行分割。例如：'font.size'
                "value" TEXT,	                --键值
                "is_server" integer NOT NULL,	--该键是用于设置服务器还是客户端，服务器：true，客户端：false
                "secret" integer NOT NULL,	    --该键是否是私密键，例如密码
                PRIMARY KEY ("key")
            );
        `);
    }

    /**
     * 初始化系统表的中的默认值
     */
    private async _initializeDefaultValue() {
        for (const item of SystemSettingTable._defaultValue) {
            await this._dbCon.run(`
                INSERT INTO "main"."system_setting" ("key", "value", "is_server", "secret")
                VALUES (?, ?, ?, ?)
            `, item).catch(() => { });
        }
    }

    /**
     * 更新非私密键
     */
    async updateNormalKey(key: string, value: any) {
        await this._dbCon.run(`
            UPDATE "main"."system_setting"
            SET "value" = ?
            WHERE "key" = ? AND "secret" = 0
        `, value, key);
    }

    /**
     * 更新私密键
     */
    async updateSecretKey(key: string, value: any) {
        await this._dbCon.run(`
            UPDATE "main"."system_setting"
            SET "value" = ?
            WHERE "key" = ? AND "secret" = 1
        `, value, key);
    }

    /**
     * 获取普通键值
     */
    async getNormalKey(key: string): Promise<any> {
        const result = await this._dbCon.get(`
            SELECT "value" FROM "main"."system_setting" 
            WHERE "key" = ? AND "secret" = 0
        `, key);

        return result.value;
    }

    /**
     * 获取私密键值
     */
    async getSecretKey(key: string): Promise<any> {
        const result = await this._dbCon.get(`
            SELECT "value" FROM "main"."system_setting" 
            WHERE "key" = ? AND "secret" = 1
        `, key);

        return result.value;
    }

    /**
     * 获取所有普通键值
     */
    async getAllNormalKey(): Promise<{ key: string, value: any, is_server: boolean }[]> {
        return await this._dbCon.all(`
            SELECT "key", "value", "is_server" FROM "main"."system_setting" 
            WHERE "secret" = 0
        `);
    }
}