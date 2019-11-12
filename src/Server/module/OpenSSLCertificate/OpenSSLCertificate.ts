import * as fs from 'fs';
import * as child_process from 'child_process';
import { BaseServiceModule } from 'service-starter';
import randomString = require('crypto-random-string');

import * as FilePath from '../../FilePath';

import { MainProcessCommunicator } from '../MainProcess/MainProcessCommunicator';

/**
 * 生成自签名openssl证书
 */
export class OpenSSLCertificate extends BaseServiceModule {

    private _mainProcessCommunicator: MainProcessCommunicator;

    /**
     * 私钥
     */
    privkey: Buffer;

    /**
     * 公钥
     */
    cert: Buffer;

    /**
     * 私钥密码
     */
    password: string | undefined;

    async onStart(): Promise<void> {
        this._mainProcessCommunicator = this.services.MainProcessCommunicator;

        if (!await this.checkCertExist())
            await this.generateCert();

        await this.readCert();
    }

    /**
     * 读取证书到内存
     */
    async readCert(): Promise<void> {
        this.privkey = await fs.promises.readFile(FilePath._opensslPrivkeyPath);
        this.cert = await fs.promises.readFile(FilePath._opensslCertPath);
        this.password = await fs.promises.readFile(FilePath._opensslPasswordPath).then(data => data.toString()).catch(() => undefined);
    }

    /**
     * 检查证书是否存在
     */
    async checkCertExist(): Promise<boolean> {
        try {
            await fs.promises.access(FilePath._opensslPrivkeyPath);
            await fs.promises.access(FilePath._opensslCertPath);
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
            const password = randomString({ length: 1024 });
            child_process.exec(
                `openssl req -x509 -newkey rsa:4096 -keyout privkey.pem -out cert.pem -days 365 -subj '/CN=${this._mainProcessCommunicator.domain}' -passout pass:${password}`
                , { cwd: FilePath._opensslKeyDir }
                , err => err ? reject(err) : fs.writeFile(FilePath._opensslPasswordPath, password, err => err ? reject(err) : resolve()));
        });
    }
}