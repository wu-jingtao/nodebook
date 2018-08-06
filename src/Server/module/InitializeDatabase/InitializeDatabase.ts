import * as fs from 'fs-extra';
import sqlDB = require('simple-sqlite-promise');
import { BaseServiceModule } from 'service-starter';

/**
 * 目前考虑到用户规模不会太大所以先使用Sqlite
 * 数据库文件保存在 '/user-data/db/nodebook_system_data.db' 下面
 */

/**
 * 初始化数据库和数据库连接
 */
export class InitializeDatabase extends BaseServiceModule {

    private _dbPath = '/user-data/db/';
    private _dbName = 'nodebook_system_data.db';

    /**
     * 数据库连接
     */
    public dbCon: sqlDB;

    async onStart(): Promise<void> {
        debugger
        await this._createDbConnection();
    }

    async onHealthCheck(): Promise<void> {
        await this.dbCon.exec('select 1;');
    }

    /**
     * 创建数据库连接
     */
    private async _createDbConnection() {
        await fs.ensureDir(this._dbPath);
        this.dbCon = await sqlDB.connectDB(this._dbPath + this._dbName);
    }
}