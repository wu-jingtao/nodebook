import * as nodemailer from 'nodemailer';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from 'observable-variable';

import { SystemSetting } from '../SystemSetting/SystemSetting';
import { OpenSSLCertificate } from '../OpenSSLCertificate/OpenSSLCertificate';

//nodemailer 内置服务商列表
const nodemailer_services_list: string[] = Object.keys(require('nodemailer/lib/well-known/services.json'));

//设置系统变量默认值
SystemSetting.addSystemSetting('mail.service', null, true, true, 'string');      //邮件服务商
SystemSetting.addSystemSetting('mail.user', null, true, true, 'string');         //账号
SystemSetting.addSystemSetting('mail.pass', null, true, true, 'string');         //授权码

/**
 * 发送邮件
 */
export class MailService extends BaseServiceModule {

    private _openSSLCertificate: OpenSSLCertificate;

    private _mailService: ObservableVariable<string | null>;
    private _mailUser: ObservableVariable<string | null>;
    private _mailPass: ObservableVariable<string | null>;

    private _userName: ObservableVariable<string>;  //登陆用户的用户名

    async onStart(): Promise<void> {
        this._openSSLCertificate = this.services.OpenSSLCertificate;
        const systemSetting = this.services.SystemSetting as SystemSetting;

        this._mailService = systemSetting.secretSettings.get('mail.service') as any;
        this._mailUser = systemSetting.secretSettings.get('mail.user') as any;
        this._mailPass = systemSetting.secretSettings.get('mail.pass') as any;

        this._userName = systemSetting.secretSettings.get('user.name') as any;

        this._mailService.on('beforeSet', newValue => {
            if (newValue != null && !nodemailer_services_list.includes(newValue))
                throw new Error(`不支持的邮件服务商：${newValue}`);
        });
    }

    /**
     * 发送邮件
     */
    async sendMail(title: string, content: string, files?: { filename: string, content: Buffer }[]): Promise<void> {
        if (this._mailService.value == null) throw new Error('邮件服务商没有设置');
        if (this._mailUser.value == null) throw new Error('邮件服务账号没有设置');
        if (this._mailPass.value == null) throw new Error('邮件服务授权码没有设置');

        const transporter = nodemailer.createTransport({
            service: this._mailService.value,
            auth: { user: this._mailUser.value, pass: this._mailPass.value }
        });

        await transporter.sendMail({
            from: `NodeBook <${this._openSSLCertificate.domain}>`,
            to: this._userName.value,
            subject: title,
            text: content,
            attachments: files
        });
    }
}