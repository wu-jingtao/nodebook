import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Error from 'http-errors';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from "observable-variable";

import { SystemSetting } from "../SystemSetting/SystemSetting";
import { MailService } from "../MailService/MailService";

//设置系统变量默认值
SystemSetting.addSystemSetting('backup.interval', 7, true, false);      //每隔几天备份一次数据，最小0，最大999。如果设置为0则表示不备份
SystemSetting.addSystemSetting('backup.maxNumber', 10, true, false);    //最多保存多少个备份，最小1。超过最大备份数后，最旧的一个备份将会被删除
SystemSetting.addSystemSetting('backup.sendEmail', true, true, false);  //每当有新的备份产生时是否将备份数据发送到用户邮箱

/**
 * 备份用户数据
 */
export class BackupData extends BaseServiceModule {

    private _mailService: MailService;
    private _systemSetting: SystemSetting;

    private _interval: ObservableVariable<number>;
    private _maxNumber: ObservableVariable<number>;
    private _sendEmail: ObservableVariable<boolean>;

    private _lastBackupTime: moment.Moment = moment();  //上一次备份的时间
    private _timer: number;                             //计时器

    async onStart(): Promise<void> {
        this._mailService = this.services.MailService;
        this._systemSetting = this.services.SystemSetting;

        this._interval = this._systemSetting.normalSettings.get('backup.interval') as any;
        this._maxNumber = this._systemSetting.normalSettings.get('backup.maxNumber') as any;
        this._sendEmail = this._systemSetting.normalSettings.get('backup.sendEmail') as any;

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
                if (oldValue == 0)
                    this._lastBackupTime = moment();

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
     * 读取某个备份文件。用于用户下载
     * @param date 备份日期
     */
    async readBackupFile(date: string): Promise<fs.ReadStream> {

    }

    /**
     * 列出所有备份文件的备份日期
     */
    async listBackupFiles(): Promise<ReadonlyArray<string>> {

    }

    /**
     * 删除某个备份文件。
     * @param date 备份日期
     */
    async deleteBackupFiles(date: string): Promise<void> {

    }



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
