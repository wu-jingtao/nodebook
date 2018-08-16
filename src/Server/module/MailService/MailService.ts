import * as nodemailer from 'nodemailer';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from 'observable-variable';

import { SystemSetting } from '../SystemSetting/SystemSetting';

//nodemailer 内置服务商列表
const nodemailer_services_list: string[] = Object.keys(require('nodemailer/lib/well-known/services.json'));

//设置系统变量默认值
SystemSetting.addSystemSetting('mail.service', undefined, true, true);      //邮件服务商
SystemSetting.addSystemSetting('mail.user', undefined, true, true);         //账号
SystemSetting.addSystemSetting('mail.pass', undefined, true, true);         //授权码

/**
 * 发送邮件
 */
export class MailService extends BaseServiceModule {

    private _mailService: ObservableVariable<string>;
    private _mailUser: ObservableVariable<string>;
    private _mailPass: ObservableVariable<string>;

    private _userName: ObservableVariable<string>;          //登陆用户的用户名
    private _userPassword: ObservableVariable<string>;      //登陆用户密码

    async onStart(): Promise<void> {
        const systemSetting = this.services.SystemSetting as SystemSetting;

        this._mailService = systemSetting.secretSettings.get('mail.service') as any;
        this._mailUser = systemSetting.secretSettings.get('mail.user') as any;
        this._mailPass = systemSetting.secretSettings.get('mail.pass') as any;

        this._userName = systemSetting.secretSettings.get('user.name') as any;
        this._userPassword = systemSetting.secretSettings.get('user.password') as any;
    }

    /**
     * 更改邮件服务商
     * @param service 服务商名称
     * @param password nodebook用户登录密码
     */
    updateMailService(service: string, password: string): void {
        if (!nodemailer_services_list.includes(service))
            throw new Error(`不支持的邮件服务商：${service}`);

        if (this._userPassword.value !== password)
            throw new Error(`输入的用户密码不正确`);

        this._mailService.value = service;
    }

    /**
     * 更改发送邮件账号
     * @param mailUser 邮箱账号
     * @param password nodebook用户登录密码
     */
    updateMailUser(mailUser: string, password: string): void {
        if (this._userPassword.value !== password)
            throw new Error(`输入的用户密码不正确`);

        this._mailUser.value = mailUser;
    }

    /**
     * 更改发送邮件授权码
     * @param mailPass 邮箱授权码
     * @param password nodebook用户登录密码
     */
    updateMailPass(mailPass: string, password: string): void {
        if (this._userPassword.value !== password)
            throw new Error(`输入的用户密码不正确`);

        this._mailPass.value = mailPass;
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