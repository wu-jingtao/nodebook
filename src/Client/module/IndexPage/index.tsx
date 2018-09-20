import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';

import { LoginPage } from '../LoginPage/LoginPage';
import { MessageBox } from '../MessageBox/MessageBox';
import { MainWindow } from '../MainWindow/MainWindow';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { PopupWindow } from '../PopupWindow/PopupWindow';

(window as any).jQuery = (window as any).$ = $;

require('./index.less');

const Index: React.StatelessComponent = () => {
    return (
        <>
            <LoginPage />
            <MainWindow />
            <PopupWindow />
            <MessageBox />
            <ContextMenu />
        </>
    );
};

ReactDom.render(<Index />, document.getElementById('root'));