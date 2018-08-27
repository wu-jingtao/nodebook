import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';

import { LoginPage } from '../LoginPage/LoginPage';
import { MessageBox } from '../MessageBox/MessageBox';

require('./index.less');

const Index: React.StatelessComponent = () => {
    return (
        <>
            <LoginPage />
            <MessageBox />
        </>
    );
}

(window as any).jQuery = (window as any).$ = $;
ReactDom.render(<Index />, document.getElementById('root'));