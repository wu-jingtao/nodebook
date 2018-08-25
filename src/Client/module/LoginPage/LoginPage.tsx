import * as React from 'react';

import { Container } from '../../global/Component/Container/Container';

require('./LoginPage.less');

/**
 * 登陆页面
 */
export class LoginPage extends React.Component {

    render() {
        return (
            <div id="LoginPage">
                <img src="./res/img/logo/brand.png" />
                <Container>
                    <div>
                        <input type="text" placeholder="用户名"/>
                    </div>
                    <div>
                        <input type="password" placeholder="密码"/>
                    </div>
                </Container>
            </div>
        );
    }
}