import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { oVar } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { LoginPage } from '../LoginPage/LoginPage';
import { MessageBox } from '../MessageBox/MessageBox';
import { MainWindow } from '../MainWindow/MainWindow';

(window as any)._ = _;
(window as any).React = React;
(window as any).ReactDom = ReactDom;
(window as any).jQuery = (window as any).$ = $;

require('./index.less');

class Index extends ObservableComponent {

    private readonly _logged = oVar(false);     //是否已经登陆

    render() {
        return (
            <>
                <LoginPage logged={this._logged} />
                <MainWindow logged={this._logged} />
                <MessageBox />
            </>
        );
    }
}

ReactDom.render(<Index />, document.getElementById('root'));