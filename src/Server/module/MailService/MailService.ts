import * as nodemailer from 'nodemailer';
import * as Error from 'http-errors';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from 'observable-variable';

import { SystemSetting } from '../SystemSetting/SystemSetting';

//nodemailer 内置服务商列表
const nodemailer_services_list: string[] = Object.keys(require('nodemailer/lib/well-known/services.json'));

//设置系统变量默认值
SystemSetting.addSystemSetting('mail.service', undefined, true, false);    //邮件服务商
SystemSetting.addSystemSetting('mail.user', undefined, true, false);       //账号
SystemSetting.addSystemSetting('mail.pass', undefined, true, false);       //授权码

/**
 * 发送邮件
 */
export class MailService extends BaseServiceModule {

    private _mailService: ObservableVariable<string>;
    private _mailUser: ObservableVariable<string>;
    private _mailPass: ObservableVariable<string>;
    private _userName: ObservableVariable<string>;      //登陆用户的用户名

    async onStart(): Promise<void> {
        const settings = (this.services.SystemSetting as SystemSetting).normalSettings;

        this._mailService = settings.get('mail.service') as any;
        this._mailUser = settings.get('mail.user') as any;
        this._mailPass = settings.get('mail.pass') as any;
        this._userName = settings.get('user.name') as any;

        //确保设置的 service 是 nodemailer 支持的
        this._mailService.on('beforeSet', newValue => {
            if (!nodemailer_services_list.includes(newValue))
                throw new Error.BadRequest(`不支持的邮件服务商：${newValue}`);
        });
    }

    /**
     * 发送邮件
     */
    async sendMail(title: string, content: string, files?: { filename: string, content: Buffer }[]): Promise<void> {
        if (this._mailService.value == null) throw new Error.BadRequest('邮件服务商没有设置');
        if (this._mailUser.value == null) throw new Error.BadRequest('邮件服务账号没有设置');
        if (this._mailPass.value == null) throw new Error.BadRequest('邮件服务授权码没有设置');

        const transporter = nodemailer.createTransport({
            service: this._mailService.value,
            auth: { user: this._mailUser.value, pass: this._mailPass.value }
        });

        await transporter.sendMail({
            from: `NodeBook <${process.env.DOMAIN}>`,
            to: this._userName.value,
            subject: title,
            text: content,
            attachments: files
        });
    }
}