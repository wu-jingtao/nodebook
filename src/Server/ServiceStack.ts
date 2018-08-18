import { DockerServicesManager } from 'service-starter';

import { OpenSSLCertificate } from './module/OpenSSLCertificate/OpenSSLCertificate';
import { InitializeDatabase } from './module/Database/InitializeDatabase';
import { SystemSettingTable } from './module/Database/SystemSettingTable';
import { ServicesTable } from './module/Database/ServicesTable';
import { SystemSetting } from './module/SystemSetting/SystemSetting';
import { MailService } from './module/MailService/MailService';
import { UserManager } from './module/UserManager/UserManager';
import { FileManager } from './module/FileManager/FileManager';
import { LibraryManager } from './module/LibraryManager/LibraryManager';
import { TaskManager } from './module/TaskManager/TaskManager';
import { LogManager } from './module/TaskManager/LogManager/LogManager';
import { ServiceManager } from './module/TaskManager/ServiceManager';
import { HttpServer } from './module/HttpServer/HttpServer';
import { BackupData } from './module/BackupData/BackupData';
import { MainProcessCommunicator } from './module/MainProcess/MainProcessCommunicator';

/**
 * 将程序模块按照注册的顺序依次启动
 */
class NodeBook_ServiceStack extends DockerServicesManager {
    constructor() {
        super();

        //MainProcess
        this.registerService(new MainProcessCommunicator)

        //FileManager
        this.registerService(new FileManager);

        //OpenSSLCertificate
        this.registerService(new OpenSSLCertificate);

        //Database
        this.registerService(new InitializeDatabase);
        this.registerService(new SystemSettingTable);
        this.registerService(new ServicesTable);

        //SystemSetting
        this.registerService(new SystemSetting);

        //MailService
        this.registerService(new MailService);

        //UserManager
        this.registerService(new UserManager);

        //BackupData
        this.registerService(new BackupData);

        //LibraryManager
        this.registerService(new LibraryManager);

        //TaskManager
        this.registerService(new LogManager);
        this.registerService(new TaskManager);
        this.registerService(new ServiceManager);

        //HttpServer
        this.registerService(new HttpServer);
    }
}

(new NodeBook_ServiceStack).start();