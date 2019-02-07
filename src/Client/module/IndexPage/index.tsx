import * as React from 'react';
import * as ReactDom from 'react-dom';

import { LoginPage } from '../LoginPage/LoginPage';
import { MessageBox } from '../MessageBox/MessageBox';
import { MainWindow } from '../MainWindow/MainWindow';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { PopupWindow } from '../PopupWindow/PopupWindow';

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