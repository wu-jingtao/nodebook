import * as fs from 'fs';
import * as child_process from 'child_process';
import { BaseServiceModule } from 'service-starter';
import randomString = require('crypto-random-string');
import log from 'log-formatter';

/**
 * 生成自签名openssl证书
 */
export class GenerateCertificate extends BaseServiceModule {

    async onStart(): Promise<void> {
        if (!(await this.checkCertExist())) {
            log.location.round(this.name, '开始创建证书');
            await this.generateCert();
        }
    }

    /**
     * 检查证书是否存在
     */
    async checkCertExist() {
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
                , (err, stdout, stderr) => {
                    err ? reject(err) : resolve();
                    console.log(stdout, stderr);
                });
        });
    }
}