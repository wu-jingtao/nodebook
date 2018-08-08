import * as nodemailer from 'nodemailer';
import { BaseServiceModule } from "service-starter";

import { SystemSettingTable } from "../Database/SystemSettingTable";

//设置系统变量
SystemSettingTable._defaultValue.push(
    ['mail.service', undefined, true, false],
    ['mail.user', undefined, true, false],
    ['mail.pass', undefined, true, false],
);

/**
 * 发送邮件
 */
export class MailService extends BaseServiceModule {

    private _settingTable: SystemSettingTable;

    private _emailService: string;  //邮件服务商
    private _user: string;          //账号
    private _pass: string;          //授权码

    /**
     * 检查参数是否已经全部配置
     */
    get isReady() {
        return this._emailService != null && this._user != null && this._pass != null;
    }

    async onStart(): Promise<void> {
        this._settingTable = this.services.SystemSettingTable;
        await this.readSetting();
    }

    /**
     * 从数据库中读取配置
     */
    async readSetting() {
        this._emailService = await this._settingTable.getNormalKey('mail.service');
        this._user = await this._settingTable.getNormalKey('mail.user');
        this._pass = await this._settingTable.getNormalKey('mail.pass');
    }

    
}