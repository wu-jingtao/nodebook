import * as crypto from 'crypto';
import * as moment from 'moment';
import * as http_error from 'http-errors';
import log from 'log-formatter';
import { BaseServiceModule } from "service-starter";
import { ObservableVariable } from "observable-variable";
import randomString = require('crypto-random-string');

import { SystemSetting } from "../SystemSetting/SystemSetting";
import { MailService } from "../MailService/MailService";

//设置系统变量默认值
SystemSetting.addSystemSetting('user.name', 'note@book.com', true, true);                                               //登陆用户的用户名
SystemSetting.addSystemSetting('user.password', crypto.createHash("md5").update('123456').digest('hex'), true, true);   //登陆密码

/**
 * 用户管理
 */
export class UserManager extends BaseServiceModule {

    private _mailService: MailService;

    private _userName: ObservableVariable<string>;
    private _password: ObservableVariable<string>;

    private _maxRetry = 0;                              //用户登陆失败最大重试。规定：连续失败10次，60分钟内禁止登陆，同时发送一份邮件提示用户
    private _loginCountdown: moment.Moment;             //超过最大重试次数之后下次最早可在什么时候登陆
    private _loginTimeout: any;                         //清除_maxRetry的倒计时器

    private readonly _tokenList: [string, NodeJS.Timer][] = [];     //判断用户是否登陆的令牌，每个令牌的有效期只有10分钟。添加令牌使用unshift

    async onStart(): Promise<void> {
        this._mailService = this.services.MailService;
        const _systemSetting = this.services.SystemSetting as SystemSetting;

        this._userName = _systemSetting.secretSettings.get('user.name') as any;
        this._password = _systemSetting.secretSettings.get('user.password') as any;
    }

    async onStop(): Promise<void> {
        this._tokenList.forEach(item => clearTimeout(item[1]));
        this._tokenList.length = 0;
    }

    /**
     * 更改用户名
     * @param username 新用户名
     * @param password 当前用户密码
     */
    updateUsername(username: string, password: string): void {
        if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(username))
            throw new Error(`用户名 '${username}' 不是有效的电子邮箱格式`);

        if (this._password.value !== password)
            throw new Error(`输入的用户密码不正确`);

        this._userName.value = username;
    }

    /**
     * 更新密码，注意：客户端在将密码发给到服务器之前应当进行MD5操作。更新失败则会抛出异常
     */
    updatePassword(newPass: string, oldPass: string): void {
        if (newPass.length === 32 && oldPass.length === 32) {
            if (this._password.value === oldPass)
                this._password.value = newPass;
            else
                throw new Error('输入的旧密码错误');
        } else
            throw new Error('传入的密码不是被MD5化后的有效字符串');
    }

    /**
     * 更新用户的令牌。
     * 当有新的令牌被添加之后，旧的令牌将在10秒后被删除。这样做是为了避免令牌的突然改变导致后续紧随而来的其他请求被拒绝
     */
    updateToken(): string {
        const token = randomString(64);
        this._tokenList.unshift([token, setTimeout(() => this._tokenList.pop(), 10 * 60 * 1000)]);

        const second = this._tokenList[1];
        if (second) {
            clearTimeout(second[1]);
            second[1] = setTimeout(() => this._tokenList.pop(), 10 * 1000);
        }

        return token;
    }

    /**
     * 根据令牌检验用户是否登录，未登录则抛出异常
     */
    checkLogin(token: string): void {
        if (!this._tokenList.some(item => item[0] === token))
            throw new http_error.Unauthorized('用户未登录或用户令牌已过期，请重新登陆');
    }

    /**
     * 检查登陆账号密码是否正确，如果不正确则抛出异常告知错误原因
     * @param ip 登陆用户的IP地址。
     * @returns 用户令牌
     */
    login(username: string, password: string, ip: string): string {
        if (this._maxRetry < 10) {
            if (this._userName.value === username && this._password.value === password) {
                this._maxRetry = 0;
                this._loginCountdown = undefined as any;
                clearTimeout(this._loginTimeout);
                log.location.text(this.name, '用户登录IP：', ip);

                this.onStop();  //清空已有令牌
                return this.updateToken();
            } else {
                this._maxRetry++;
                throw new Error('账号或密码错误');
            }
        }

        if (this._maxRetry === 11) {
            this._maxRetry++;
            this._mailService.sendMail('NodeBook 连续登陆失败', `NodeBook <${process.env.DOMAIN}> 账号 <${this._userName.value}> 连续登陆失败超过10次。\n登陆用户IP：${ip}`).catch(() => { });
        }

        this._loginCountdown = moment().add(1, 'h');
        clearTimeout(this._loginTimeout);
        this._loginTimeout = setTimeout(() => this._maxRetry = 0, 60 * 60 * 1000);
        log.error.location.text.text.bold(this.name, 'NodeBook 连续登陆失败。登陆用户IP：', ip);

        const countdown = Math.trunc(moment.duration(this._loginCountdown.diff(Date.now())).asMinutes());
        throw new Error(`登陆失败超过了最大重试次数，距下次可重新登陆还有 ${countdown} 分钟`);
    }
}