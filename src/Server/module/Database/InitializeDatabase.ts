import sqlDB = require('simple-sqlite-promise');
import { BaseServiceModule } from 'service-starter';

import { FileManager } from '../FileManager/FileManager';

/**
 * 初始化数据库和数据库连接
 */
export class InitializeDatabase extends BaseServiceModule {

    /**
     * 数据库连接
     */
    public dbCon: sqlDB;

    async onStart(): Promise<void> {
        this.dbCon = await sqlDB.connectDB(FileManager._databasePath);
    }

    async onStop(): Promise<void> {
        if (this.dbCon !== undefined)
            await this.dbCon.close();
    }

    async onHealthCheck(): Promise<void> {
        await this.dbCon.exec('select 1;');
    }
}