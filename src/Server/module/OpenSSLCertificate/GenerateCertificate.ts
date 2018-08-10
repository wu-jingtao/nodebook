import * as fs from 'fs';
import * as child_process from 'child_process';
import { BaseServiceModule } from 'service-starter';
import randomString = require('crypto-random-string');

/**
 * 生成自签名openssl证书
 */
export class GenerateCertificate extends BaseServiceModule {

    async onStart(): Promise<void> {
        if (!await this.checkCertExist()) {
            await this.generateCert();
        }
    }

    /**
     * 检查证书是否存在
     */
    async checkCertExist(): Promise<boolean> {
        try {
            await fs.promises.access('/key/privkey.pem');
            await fs.promises.access('/key/cert.pem');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 创建证书
     */
    generateCert(): Promise<void> {
        return new Promise((resolve, reject) => {
            child_process.exec(
                `openssl req -x509 -newkey rsa:4096 -keyout privkey.pem -out cert.pem -days 365 -subj '/CN=${process.env.DOMAIN}' -passout pass:${randomString(30)}`
                , { cwd: '/key' }
                , err => err ? reject(err) : resolve());
        });
    }
}