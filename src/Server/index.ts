import { BaseServicesManager, DockerServicesManager } from 'service-starter';
import { GenerateCertification } from './module/GenerateCertification/GenerateCertification';

const manager = new BaseServicesManager();

manager.registerService(new GenerateCertification);

manager.start();