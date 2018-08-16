import * as node_path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as node_pty from 'node-pty';
import * as archiver from 'archiver';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from "observable-variable";
import randomString = require('crypto-random-string');

import { SystemSetting } from "../SystemSetting/SystemSetting";
import { MailService } from "../MailService/MailService";
import { FileManager } from '../FileManager/FileManager';

const os_tempDir = os.tmpdir();

//设置系统变量默认值
SystemSetting.addSystemSetting('backup.interval', 7, true, false);              //每隔几天备份一次数据，最小0，最大999。如果设置为0则表示不备份
SystemSetting.addSystemSetting('backup.maxNumber', 10, true, false);            //最多保存多少个备份，最小1。超过最大备份数后，最旧的一个备份将会被删除
SystemSetting.addSystemSetting('backup.autoSendEmail', true, true, false);      //是否每当有新的备份产生时自动将备份数据发送到用户邮箱
SystemSetting.addSystemSetting('backup.encryptEmailFile', true, true, false);   //是否加密发送到邮箱的文件，密码是用户密码的MD5值

/**
 * 备份用户数据
 */
export class BackupData extends BaseServiceModule {

    private _mailService: MailService;

    private _interval: ObservableVariable<number>;
    private _maxNumber: ObservableVariable<number>;
    private _autoSendEmail: ObservableVariable<boolean>;
    private _encryptEmailFile: ObservableVariable<boolean>;
    private _userPassword: ObservableVariable<string>;

    private _lastBackupTime: moment.Moment = moment();  //上一次备份的时间
    private _timer: number;                             //计时器

    async onStart(): Promise<void> {
        const _systemSetting: SystemSetting = this.services.SystemSetting;
        this._mailService = this.services.MailService;

        this._interval = _systemSetting.normalSettings.get('backup.interval') as any;
        this._maxNumber = _systemSetting.normalSettings.get('backup.maxNumber') as any;
        this._autoSendEmail = _systemSetting.normalSettings.get('backup.autoSendEmail') as any;
        this._encryptEmailFile = _systemSetting.normalSettings.get('backup.encryptEmailFile') as any;
        this._userPassword = _systemSetting.secretSettings.get('user.password') as any;

        this._interval.on('beforeSet', newValue => {
            if (!_.isNumber(newValue))
                throw new Error.BadRequest('backup.interval 属性的类型必须是数字');

            if (newValue < 0 || newValue > 999)
                throw new Error.BadRequest('backup.interval 的值并不符合要求的范围');
        });

        this._maxNumber.on('beforeSet', newValue => {
            if (!_.isNumber(newValue))
                throw new Error.BadRequest('backup.maxNumber 属性的类型必须是数字');

            if (newValue < 1)
                throw new Error.BadRequest('backup.maxNumber 的值必须大于1');
        });

        this._interval.on('set', (newValue, oldValue) => {
            this.onStop();  //清除旧的计时器
            if (newValue != 0) {
                if (oldValue == 0) this._lastBackupTime = moment();

                //计算时间差
                const timeDiff = moment.duration(moment().add(newValue, 'days').diff(this._lastBackupTime)).valueOf();
                this._timer = setTimeout(() => this._backup(), timeDiff);
            }
        });

        this._maxNumber.on('set', () => this._cleanOldBackup());

        this._interval.value = this._interval.value;    //初始化计时器
    }

    async onStop(): Promise<void> {
        clearTimeout(this._timer);
    }

    /**
     * 确保某个备份文件存在
     */
    private async _ensureBackupFile(filename: string): Promise<string> {
        try {
            const path = node_path.join(FileManager._userDataBackupDir, filename);
            const stats = await fs.promises.stat(path);
            if (!stats.isFile()) throw "";

            return path;
        } catch  {
            throw new Error.BadRequest(`没有备份文件：${filename}`);
        }
    }

    /**
     * 读取某个备份文件。用于用户下载
     */
    async readBackupFile(filename: string): Promise<fs.ReadStream> {
        return fs.createReadStream(await this._ensureBackupFile(filename));
    }

    /**
     * 将某个备份文件发送到用户邮箱
     */
    async sendBackupEmail(filename: string): Promise<void> {
        const path = await this._ensureBackupFile(filename);
        const text = `nodebook 用户数据备份 ${filename}`;

        if (this._encryptEmailFile.value) {
            return new Promise<void>((resolve, reject) => {
                const temp_path = node_path.join(os_tempDir, `nodebook_${randomString(20)}.zip`);   //临时文件目录
                const process = node_pty.spawn('zipcloak', ['-O', temp_path, path]);                //加密备份文件

                process.on('data', data => {
                    if (data.includes('password'))  //zipcloak会要求重复输入两次密码
                        process.write(this._userPassword.value + '\r');
                });

                process.on('exit', async (code) => {
                    if (code === 0) {
                        this._mailService.sendMail(text, text, [{ filename, content: await fs.promises.readFile(temp_path) }])
                            .then(resolve).catch(reject).then(() => fs.remove(temp_path).catch(() => { }));
                    } else
                        reject(new Error.InternalServerError('加密备份文件失败'));
                });
            });
        } else
            await this._mailService.sendMail(text, text, [{ filename, content: await fs.promises.readFile(path) }]);
    }

    /**
     * 列出所有备份文件的文件名
     */
    async listBackupFiles(): Promise<ReadonlyArray<string>> {
        const files = await fs.promises.readdir(FileManager._userDataBackupDir);
        return files.filter(item => /^\d{4}-\d{2}-\d{2}_\d{2}∶\d{2}∶\d{2}\.zip$/.test(item));   //确保正确性
    }

    /**
     * 删除某个备份文件
     */
    async deleteBackupFiles(filename: string): Promise<void> {
        await fs.remove(await this._ensureBackupFile(filename));
    }

    /**
     * 根据日期返回，备份文件路径
     */
    /*     private _backupFilePath(date: string | moment.Moment): string {
            if (typeof date === 'string')
                return node_path.join(FileManager._userDataBackupDir, date + '.zip');
            else
                return node_path.join(FileManager._userDataBackupDir, date.format('YYYY-MM-DD_HH∶mm∶ss') + '.zip');
        } */

    /**
     * 备份数据
     */
    private _backup() {

    }

    /**
     * 清理旧的备份数据
     */
    private _cleanOldBackup() {

    }
}
