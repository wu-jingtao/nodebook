import * as React from 'react';
import { oVar } from 'observable-variable';
import md5 = require('blueimp-md5');

import * as Ajax from '../../global/Tools/Ajax';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { Container } from '../../global/Component/Container/Container';
import { TextInput } from '../../global/Component/TextInput/TextInput';
import { Button } from '../../global/Component/Button/Button';

import { showMessageBox } from '../MessageBox/MessageBox';

const less = require('./LoginPage.less');

/**
 * 登陆页面
 */
export class LoginPage extends ObservableComponent {

    private readonly _userName = oVar('');      //用户名
    private readonly _password = oVar('');      //密码
    private readonly _logging = oVar(false);    //是否正在登陆
    private readonly _logged = oVar(false);     //是否已经登陆

    /**
     * 登陆系统
     */
    private login() {
        if (!this._logging.value) {
            this._logging.value = true;
            Ajax.Post('', { user: this._userName.value, pass: md5(this._password.value) });
        }
    }

    componentDidMount() {
        this.watch(this._userName, this._password, this._logging);
    }

    render() {
        return (
            <form id="LoginPage" onSubmit={e => { e.preventDefault(); this.login(); }}>
                <img className={less.logo} src="./res/img/logo/brand.png" alt="nodebook" />
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
                <Button className={less.button} loading={this._logging.value} disabled={this._logging.value}>登陆</Button>


                <button onClick={() => showMessageBox({ title: '123' })}>a</button>
            </form>

        );
    }
}