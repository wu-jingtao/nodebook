import * as nodemailer from 'nodemailer';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from 'observable-variable';

import { SystemSettingTable } from "../Database/SystemSettingTable";
import { SystemSetting } from '../SystemSetting/SystemSetting';

//nodemailer 内置服务商列表
const nodemailer_services_list: string[] = Object.keys(require('nodemailer/lib/well-known/services.json'));

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

    private _mailService: ObservableVariable<string>;   //邮件服务商
    private _mailUser: ObservableVariable<string>;      //账号
    private _mailPass: ObservableVariable<string>;      //授权码
    private _userName: ObservableVariable<string>;      //登陆用户的用户名

    async onStart(): Promise<void> {
        const settings = (this.services.SystemSetting as SystemSetting).settings;

        this._mailService = settings.get('mail.service') as any;
        this._mailUser = settings.get('mail.user') as any;
        this._mailPass = settings.get('mail.pass') as any;
        this._userName = settings.get('user.name') as any;

        //确保设置的service是nodemailer支持的
        this._mailService.on('beforeSet', newValue => nodemailer_services_list.includes(newValue));
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
            from: `NodeBook <${process.env.DOMAIN}>`,
            to: this._userName.value,
            subject: title,
            text: content,
            attachments: files
        });
    }
}