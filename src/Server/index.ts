import { DockerServicesManager } from 'service-starter';

import { GenerateCertification } from './module/GenerateCertification/GenerateCertification';
import { InitializeDatabase } from './module/InitializeDatabase/InitializeDatabase';

const manager = new DockerServicesManager();

manager.registerService(new GenerateCertification);
manager.registerService(new InitializeDatabase);

manager.start();