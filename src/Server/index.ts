import { DockerServicesManager } from 'service-starter';

import { GenerateCertificate } from './module/OpenSSLCertificate/GenerateCertificate';
import { InitializeDatabase } from './module/Database/InitializeDatabase';

const manager = new DockerServicesManager();

manager.registerService(new GenerateCertificate);
manager.registerService(new InitializeDatabase);

manager.start();