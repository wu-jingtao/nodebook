import { DockerServicesManager } from 'service-starter';

import { GenerateCertificate } from './module/OpenSSLCertificate/GenerateCertificate';
import { InitializeDatabase } from './module/Database/InitializeDatabase';
import { SystemSettingTable } from './module/Database/SystemSettingTable';
import { ServicesTable } from './module/Database/ServicesTable';

const manager = new DockerServicesManager();

//OpenSSLCertificate
manager.registerService(new GenerateCertificate);

//Database
manager.registerService(new InitializeDatabase);
manager.registerService(new SystemSettingTable);
manager.registerService(new ServicesTable);

manager.start();