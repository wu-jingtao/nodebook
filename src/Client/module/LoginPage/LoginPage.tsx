import * as React from 'react';
import { oVar, ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { Container } from '../../global/Component/Container/Container';
import { TextInput } from '../../global/Component/TextInput/TextInput';
import { Button } from '../../global/Component/Button/Button';
import { showMessageBox } from '../MessageBox/MessageBox';
import { ServerApi } from '../../global/ServerApi';
import { loadSystemSetting } from '../../global/SystemSetting';

const less = require('./LoginPage.less');

/**
 * 登陆页面
 */
export class LoginPage extends ObservableComponent<{ logged: ObservableVariable<boolean> }> {

    private readonly _userName = oVar('');          //用户名
    private readonly _password = oVar('');          //密码
    private readonly _logging = oVar(true);         //是否正在登陆
    private readonly _logged = this.props.logged;   //是否已经登陆
    private _timer: any;                            //定时更新令牌计时器

    /**
     * 登陆系统
     */
    private async _login(): Promise<void> {
        try {
            this._logging.value = true;
            await ServerApi.user.login(this._userName.value, this._password.value);
            await loadSystemSetting();
            this._logged.value = true;
        } catch (error) {
            this._logged.value = false;
            showMessageBox({ icon: 'error', title: error.message });
        } finally {
            this._logging.value = false;
        }
    }

    componentDidMount() {
        this.watch(this._userName, this._password, this._logging, this._logged);

        this._logged.on('set', value => {
            if (value) {    //登录成功后每隔7分钟更新一次令牌
                this._timer = setInterval(async () => { 
                    try {
                        await ServerApi.user.updateToken();
                    } catch (error) {
                        this._logged.value = false;
                        showMessageBox({ icon: "error", title: error.message });
                    }
                }, 7 * 60 * 1000);
            } else
                clearInterval(this._timer);
        });

        //第一次打开后检查是否已经登录
        ServerApi.user.updateToken().then(async () => {
            await loadSystemSetting();
            this._logged.value = true;
            this._logging.value = false;
        }).catch(() => {
            this._logging.value = false;
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        clearInterval(this._timer);
    }

    render() {
        if (this._logged.value) {
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