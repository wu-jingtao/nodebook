import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';
import { oVar } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { LoginPage } from '../LoginPage/LoginPage';
import { MessageBox } from '../MessageBox/MessageBox';
import { MainWindow } from '../MainWindow/MainWindow';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { PopupWindow } from '../PopupWindow/PopupWindow';

(window as any).jQuery = (window as any).$ = $;

require('./index.less');

class Index extends ObservableComponent {

    private readonly _logged = oVar(false);     //是否已经登陆

    render() {
        return (
            <>
                <LoginPage logged={this._logged} />
                <MainWindow logged={this._logged} />
                <PopupWindow />
                <MessageBox />
                <ContextMenu />
            </>
        );
    }
}

ReactDom.render(<Index />, document.getElementById('root'));