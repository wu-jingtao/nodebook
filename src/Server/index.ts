import { DockerServicesManager } from 'service-starter';

import { GenerateCertificate } from './module/OpenSSLCertificate/GenerateCertificate';
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

const manager = new DockerServicesManager();

//FileManager
manager.registerService(new FileManager);

//OpenSSLCertificate
manager.registerService(new GenerateCertificate);

//Database
manager.registerService(new InitializeDatabase);
manager.registerService(new SystemSettingTable);
manager.registerService(new ServicesTable);

//SystemSetting
manager.registerService(new SystemSetting);

//MailService
manager.registerService(new MailService);

//UserManager
manager.registerService(new UserManager);

//LibraryManager
manager.registerService(new LibraryManager);

//TaskManager
manager.registerService(new LogManager);
manager.registerService(new TaskManager);
manager.registerService(new ServiceManager);

manager.start();