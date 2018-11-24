import * as React from 'react';
import { oVar, ObservableVariable, permanent_oVar } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { Container } from '../../global/Component/Container/Container';
import { TextInput } from '../../global/Component/TextInput/TextInput';
import { Button } from '../../global/Component/Button/Button';
import { ServerApi } from '../../global/ServerApi';
import { loadSystemSetting, normalSettings } from '../../global/SystemSetting';
import { showMessageBox } from '../MessageBox/MessageBox';

const less = require('./LoginPage.less');

/**
 * 是否已经登录
 */
export const logged = oVar(false);

/**
 * 登陆页面
 */
export class LoginPage extends ObservableComponent {

    private readonly _userName = permanent_oVar('ui.LoginPage._userName', { defaultValue: '' });    //用户名
    private readonly _password = oVar('');                                                          //密码
    private readonly _logging = oVar(true);                                                         //是否正在登陆
    private _timer: any;                                                                            //定时更新令牌计时器

    //登陆系统
    private async _login(): Promise<void> {
        try {
            this._logging.value = true;
            await ServerApi.user.login(this._userName.value, this._password.value);
            await this._loadSystemSetting();
            this._password.value = '';
            logged.value = true;
        } catch (error) {
            logged.value = false;
            showMessageBox({ icon: 'error', title: error.message });
        } finally {
            this._logging.value = false;
        }
    }

    //加载系统设置
    private async _loadSystemSetting(): Promise<void> {
        await loadSystemSetting();

        //设置浏览器标题栏文字
        const programName = normalSettings.get('client.programName') as ObservableVariable<string>;
        programName.on('set', value => document.title = value);
        document.title = programName.value;
    }

    componentDidMount() {
        this.watch([this._userName, this._password, this._logging, logged]);

        //登录成功后每隔7分钟更新一次令牌
        logged.on('set', value => {
            if (value) {
                this._timer = setInterval(async () => {
                    try {
                        await ServerApi.user.updateToken();
                    } catch (error) {
                        logged.value = false;
                        showMessageBox({ icon: "error", title: error.message });
                    }
                }, 7 * 60 * 1000);
            } else
                clearInterval(this._timer);
        });

        //第一次打开后检查是否已经登录
        ServerApi.user.updateToken()
            .then(async () => {
                await this._loadSystemSetting();
                logged.value = true;
            })
            .catch(() => { })
            .finally(() => {
                this._logging.value = false;
            });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        clearInterval(this._timer);
    }

    render() {
        if (logged.value) {
            return false;
        } else {
            let content;

            if (this._logging.value) {
                content = (
                    <div className={less.logging}>
                        <i /><span>正在登陆...</span>
                    </div>
                );
            } else {
                content = (
                    <>
                        <Container className={less.loginForm} noBorder darkBack>
                            <div>
                                <i className="iconfont icon-user"></i>
                                <TextInput type="email" value={this._userName} placeholder="邮箱" required />
                            </div>
                            <div>
                                <i className="iconfont icon-password"></i>
                                <TextInput type="password" value={this._password} placeholder="密码" required />
                            </div>
                        </Container>
                        <Button className={less.button}>登陆</Button>
                    </>
                );
            }

            return (
                <form id="LoginPage" onSubmit={e => { e.preventDefault(); this._login(); }}>
                    <img className={less.logo} src="/logo/brand.png" alt="nodebook" />
                    {content}
                </form>
            );
        }
    }
}