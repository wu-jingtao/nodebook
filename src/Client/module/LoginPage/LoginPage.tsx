import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { Container } from '../../global/Component/Container/Container';
import { TextInput } from '../../global/Component/TextInput/TextInput';
import { Button } from '../../global/Component/Button/Button';
import { showMessageBox } from '../MessageBox/MessageBox';
import { ServerApi } from '../../global/ServerApi';

const less = require('./LoginPage.less');

/**
 * 登陆页面
 */
export class LoginPage extends ObservableComponent {

    private readonly _userName = oVar('');      //用户名
    private readonly _password = oVar('');      //密码
    private readonly _logging = oVar(true);     //是否正在登陆
    private readonly _logged = oVar(false);     //是否已经登陆

    /**
     * 登陆系统
     */
    private async _login(): Promise<void> {
        this._logging.value = true;
        try {
            await ServerApi.user.login(this._userName.value, this._password.value);
            this._logged.value = true;
        } catch (error) {
            showMessageBox({ icon: 'error', title: error.message });
        } finally {
            this._logging.value = false;
        }
    }

    /**
     * 更新用户令牌
     * @param showErrorMessage 是否显示错误消息
     */
    private async _updateToken(showErrorMessage: boolean = true): Promise<void> {
        try {
            await ServerApi.user.updateToken();
            this._logged.value = true;
        } catch (error) {
            if (showErrorMessage) showMessageBox({ icon: "error", title: error.message });
            this._logged.value = false;
        } finally {
            this._logging.value = false;
        }
    }

    componentDidMount() {
        this.watch(this._userName, this._password, this._logging, this._logged);
        this._updateToken();
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
                    <img className={less.logo} src="./res/img/logo/brand.png" alt="nodebook" />
                    {content}
                </form>
            );
        }
    }
}