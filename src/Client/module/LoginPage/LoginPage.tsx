import * as React from 'react';
import { oVar, watch } from 'observable-variable';

import { SystemState } from '../../global/SystemState';
import { Container } from '../../global/Component/Container/Container';
import { TextInput } from '../../global/Component/TextInput/TextInput';

const style = require('./LoginPage.less');

/**
 * 登陆页面
 */
export class LoginPage extends React.Component {

    private readonly _userName = oVar('');
    private readonly _password = oVar('');

    componentWillUnmount = watch([this._userName, this._password], () => this.forceUpdate());

    render() {
        return (
            <div id="LoginPage">
                <img className={style.logo} src="./res/img/logo/brand.png" />
                <Container className={style.loginForm} noBorder darkBack>
                    <div>
                        <i className="iconfont icon-user"></i>
                        <TextInput type="text" value={this._userName} placeholder="邮箱" />
                    </div>
                    <div>
                        <i className="iconfont icon-password"></i>
                        <TextInput type="password" value={this._password} placeholder="密码" />
                    </div>
                </Container>
            </div>
        );
    }
}