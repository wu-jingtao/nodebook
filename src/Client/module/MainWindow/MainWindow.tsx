import * as React from 'react';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { logged } from '../LoginPage/LoginPage';
import { SideBar } from './Area/SideBar/SideBar';
import { FunctionArea } from './Area/FunctionArea/FunctionArea';
import { LogWindow } from './Area/LogWindow/LogWindow';

const less = require('./MainWindow.less');

/**
 * 程序的主窗体
 */
export class MainWindow extends ObservableComponent {

    componentDidMount() {
        this.watch(logged);
    }

    render() {
        if (logged.value) {
            return (
                <div id="MainWindow">
                    <SideBar />
                    <FunctionArea />
                    <div className={less.right}>
                        <LogWindow />
                    </div>
                </div>
            );
        } else
            return false;
    }
}