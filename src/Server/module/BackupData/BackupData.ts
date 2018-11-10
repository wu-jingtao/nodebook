import * as node_path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as node_pty from 'node-pty';
import * as archiver from 'archiver';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from "observable-variable";
import log from 'log-formatter';
import randomString = require('crypto-random-string');

import * as FilePath from '../../FilePath';
import { SystemSetting } from "../SystemSetting/SystemSetting";
import { MailService } from "../MailService/MailService";
import { MainProcessCommunicator } from '../MainProcess/MainProcessCommunicator';
import { FileManager } from '../FileManager/FileManager';

//设置系统变量默认值
SystemSetting.addSystemSetting('backup.interval', 7, true, 'number');              //每隔几天备份一次数据，最小0，最大999。如果设置为0则表示不备份
SystemSetting.addSystemSetting('backup.maxNumber', 10, true, 'number');            //最多保存多少个备份，最小1。超过最大备份数后，最旧的一个备份将会被删除
SystemSetting.addSystemSetting('backup.autoSendEmail', true, true, 'boolean');     //是否每当有新的备份产生时自动将备份数据发送到用户邮箱
SystemSetting.addSystemSetting('backup.encryptEmailFile', true, true, 'boolean');  //是否加密发送到邮箱的文件，密码是用户密码的MD5值

/**
 * 备份用户数据
 */
export class BackupData extends BaseServiceModule {

    private _mailService: MailService;
    private _mainProcessCommunicator: MainProcessCommunicator

    private _interval: ObservableVariable<number>;
    private _maxNumber: ObservableVariable<number>;
    private _autoSendEmail: ObservableVariable<boolean>;
    private _encryptEmailFile: ObservableVariable<boolean>;

    private _userPassword: ObservableVariable<string>;

    private _lastBackupTime: moment.Moment = moment();  //上一次备份的时间
    private _timer: any;                                //计时器

    async onStart(): Promise<void> {
        const _systemSetting: SystemSetting = this.services.SystemSetting;
        this._mailService = this.services.MailService;
        this._mainProcessCommunicator = this.services.MainProcessCommunicator;

        this._interval = _systemSetting.secretSettings.get('backup.interval') as any;
        this._maxNumber = _systemSetting.secretSettings.get('backup.maxNumber') as any;
        this._autoSendEmail = _systemSetting.secretSettings.get('backup.autoSendEmail') as any;
        this._encryptEmailFile = _systemSetting.secretSettings.get('backup.encryptEmailFile') as any;

        this._userPassword = _systemSetting.secretSettings.get('user.password') as any;

        this._interval.on('beforeSet', newValue => {
            if (newValue < 0 || newValue > 999)
                throw new Error('backup.interval 的值并不符合要求的范围');
        });

        this._maxNumber.on('beforeSet', newValue => {
            if (newValue < 1)
                throw new Error('backup.maxNumber 的值必须大于1');
        });

        const timer = (newValue: number, oldValue: number) => {
            this.onStop();  //清除旧的计时器
            if (newValue != 0) {
                if (oldValue == 0) this._lastBackupTime = moment();

                //计算时间差
                const timeDiff = moment.duration(moment().add(newValue, 'days').diff(this._lastBackupTime));
                this._timer = setTimeout(() => this._autoBackup(), timeDiff.asMilliseconds());
            }
        }

        this._interval.on('set', timer);
        this._maxNumber.on('set', () => this._cleanOldBackup());

        timer(this._interval.value, this._interval.value);    //初始化计时器
    }

    async onStop(): Promise<void> {
        clearTimeout(this._timer);
    }

    /**
     * 读取某个备份文件。用于用户下载
     */
    async readBackupFile(filename: string): Promise<fs.ReadStream> {
        const path = node_path.join(FilePath._userDataBackupDir, filename);
        await FileManager._isFile(path);
        return fs.createReadStream(path);
    }

    /**
     * 将某个备份文件发送到用户邮箱
     */
    async sendBackupEmail(filename: string): Promise<void> {
        const path = node_path.join(FilePath._userDataBackupDir, filename);
        const text = `nodebook 用户数据备份 ${filename}`;

        if (this._encryptEmailFile.value) {
            return new Promise<void>((resolve, reject) => {
                const temp_path = node_path.join(os.tmpdir(), `nodebook_${randomString(20)}.zip`);   //临时文件目录
                const process = node_pty.spawn('zipcloak', ['-O', temp_path, path], {});             //加密备份文件

                process.on('data', data => {
                    if (data.includes('password'))  //zipcloak会要求重复输入两次密码
                        process.write(this._userPassword.value + '\r');
                });

                process.on('exit', async (code) => {
                    try {
                        if (code === 0) {
                            await this._mailService.sendMail(text, text, [{ filename, content: await fs.promises.readFile(temp_path) }]);
                            resolve();
                        } else
                            reject(new Error('加密备份文件失败'));
                    } catch (error) {
                        reject(error);
                    } finally {
                        await fs.remove(temp_path).catch(() => { });
                    }
                });
            });
        } else
            await this._mailService.sendMail(text, text, [{ filename, content: await fs.promises.readFile(path) }]);
    }

    /**
     * 列出所有备份文件的文件名
     */
    async listBackupFiles(): Promise<ReadonlyArray<string>> {
        const files = await fs.promises.readdir(FilePath._userDataBackupDir);
        return files.filter(item => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/.test(item));   //确保正确性
    }

    /**
     * 删除某个备份文件
     */
    async deleteBackupFiles(filename: string): Promise<void> {
        await fs.remove(node_path.join(FilePath._userDataBackupDir, filename));
    }

    /**
     * 创建备份。目前只会备份，_logoDir、_userCodeDir、_recycleDir、_databaseDir 和 package.json
     */
    createBackupFile(): Promise<string> {
        return new Promise((resolve, reject) => {
            const filename = moment().format('YYYY-MM-DD_HH-mm-ss') + '.zip';
            const path = node_path.join(FilePath._userDataBackupDir, filename);
            const output = fs.createWriteStream(path);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve(filename));
            archive.on('error', (err) => {
                fs.remove(path).catch(() => { }); //确保不会生成空压缩包
                reject(err);
            });

            archive.file(node_path.join(FilePath._userDataDir, 'package.json'), { name: 'package.json' });
            archive.directory(FilePath._userCodeDir, node_path.basename(FilePath._userCodeDir));
            archive.directory(FilePath._recycleDir, node_path.basename(FilePath._recycleDir));
            archive.directory(FilePath._databaseDir, node_path.basename(FilePath._databaseDir));
            archive.directory(FilePath._logoDir, node_path.basename(FilePath._logoDir));

            archive.finalize();
            archive.pipe(output);
        });
    }

    /**
     * 从备份文件中恢复数据。注意，恢复数据会导致nodebook重启
     */
    resumeFromBackup(filename: string, userPassword: string): void {
        if (this._userPassword.value === userPassword)
            setTimeout(() => this._mainProcessCommunicator.restartAndRun(`npm run resumeFromBackup ${filename}`), 1000);
        else
            throw new Error('用户密码错误');
    }

    /**
     * 定时备份数据
     */
    private async _autoBackup(): Promise<void> {
        try {
            const filename = await this.createBackupFile();
            await this._cleanOldBackup();

            this._lastBackupTime = moment();
            this._interval.value = this._interval.value;    //重置计时器

            if (this._autoSendEmail.value) await this.sendBackupEmail(filename);
        } catch (error) {
            log.error.location.text.content(this.name, '定时备份数据时发生异常', error);
        }
    }

    /**
     * 清理旧的备份数据
     */
    private async _cleanOldBackup(): Promise<void> {
        try {
            const modifyTime = [];  //检索每个备份文件的创建时间
            for (const item of await this.listBackupFiles()) {
                const path = node_path.join(FilePath._userDataBackupDir, item);
                const stats = await fs.promises.stat(path);
                modifyTime.push({ path, time: stats.mtime });
            }
            modifyTime.sort((a, b) => a.time.valueOf() - b.time.valueOf())  //按照创建时间从早到晚排序

            const deleteNumber = modifyTime.length - this._maxNumber.value;
            if (deleteNumber > 0) { //如果大于最大保存数目则删除过期的
                for (const item of modifyTime.slice(0, deleteNumber)) {
                    await fs.remove(item.path);
                }
            }
        } catch (error) {
            log.error.location.text.content(this.name, '清理旧的备份数据时发生异常', error);
        }
    }
}
