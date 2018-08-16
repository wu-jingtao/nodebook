import * as fs from 'fs';
import * as child_process from 'child_process';
import { BaseServiceModule } from 'service-starter';
import randomString = require('crypto-random-string');

import { FileManager } from '../FileManager/FileManager';

/**
 * 生成自签名openssl证书
 */
export class OpenSSLCertificate extends BaseServiceModule {

    privkey: Buffer;
    cert: Buffer;

    async onStart(): Promise<void> {
        if (!await this.checkCertExist()) 
            await this.generateCert();
        
        await this.readCert();
    }

    /**
     * 读取证书到内存
     */
    async readCert(): Promise<void> {
        this.privkey = await fs.promises.readFile(FileManager._opensslPrivkeyPath);
        this.cert = await fs.promises.readFile(FileManager._opensslCertPath);
    }

    /**
     * 检查证书是否存在
     */
    async checkCertExist(): Promise<boolean> {
        try {
            await fs.promises.access(FileManager._opensslPrivkeyPath);
            await fs.promises.access(FileManager._opensslCertPath);
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
                , { cwd: FileManager._opensslKeyDir }
                , err => err ? reject(err) : resolve());
        });
    }
}