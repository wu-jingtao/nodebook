import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { LoginPage } from '../LoginPage/LoginPage';
import { MessageBox } from '../MessageBox/MessageBox';
import { MainWindow } from '../MainWindow/MainWindow';

require('./index.less');

const Index: React.StatelessComponent = () => {
    return (
        <>
            <MainWindow />
            <LoginPage />
            <MessageBox />
        </>
    );
}

(window as any)._ = _;
(window as any).jQuery = (window as any).$ = $;
ReactDom.render(<Index />, document.getElementById('root'));