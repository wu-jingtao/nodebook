import * as React from 'react';
import { oVar, watch } from 'observable-variable';

import { SystemState } from '../../global/SystemState';
import { Container } from '../../global/Component/Container/Container';
import { TextInput } from '../../global/Component/TextInput/TextInput';
import { Button } from '../../global/Component/Button/Button';

const style = require('./LoginPage.less');

/**
 * 登陆页面
 */
export class LoginPage extends React.PureComponent {

    private readonly _userName = oVar('');      //用户名
    private readonly _password = oVar('');      //密码
    private readonly _logging = oVar(false);    //是否正在登陆

    /**
     * 登陆系统
     */
    private login() {
        if (!this._logging.value) {
            this._logging.value = true;
        }
    }

    render() {
        return (
            <form id="LoginPage" onSubmit={e => { e.preventDefault(); this.login(); }}>
                <img className={style.logo} src="./res/img/logo/brand.png" alt="nodebook" />
                <Container className={style.loginForm} noBorder darkBack>
                    <div>
                        <i className="iconfont icon-user"></i>
                        <TextInput type="email" value={this._userName} placeholder="邮箱" required />
                    </div>
                    <div>
                        <i className="iconfont icon-password"></i>
                        <TextInput type="password" value={this._password} placeholder="密码" required />
                    </div>
                </Container>
                <Button className={style.button} loading={this._logging.value}>登陆</Button>
            </form>
        );
    }

    componentWillUnmount = watch([this._userName, this._password, this._logging], () => this.forceUpdate());
    shouldComponentUpdate() { return false; }
}