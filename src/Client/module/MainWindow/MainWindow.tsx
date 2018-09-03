import * as React from 'react';
import { oVar, ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { permanent_oVar, permanent_oArr } from '../../global/Tools/PermanentVariable';
import { SideBar } from './Area/SideBar/SideBar';
import { FunctionArea } from './Area/FunctionArea/FunctionArea';
import { LogWindow } from './Area/LogWindow/LogWindow';
import { functionAreaDisplayType } from './Area/FunctionArea/FunctionAreaPropsType';
import { showLogWindow, logWindows } from './Area/LogWindow/LogWindowPropsType';
import { contentWindows } from './Area/ContentWindow/ContentWindowPropsType';
import { fileManagerNumber, serviceManagerErrorNumber } from './Area/SideBar/SideBarPropsType';

const less = require('./MainWindow.less');

/**
 * 程序的主窗体
 */
export class MainWindow extends ObservableComponent<{ logged: ObservableVariable<boolean> }> {

    private readonly _functionAreaDisplayType: functionAreaDisplayType = permanent_oVar('ui.MainWindow._functionAreaDisplayType', '"file"');
    private readonly _showLogWindow: showLogWindow = permanent_oVar('ui.MainWindow._showLogWindow', 'false');
    private readonly _logWindows: logWindows = permanent_oArr('ui.MainWindow._logWindows', undefined, [{ key: 'z_index', type: ObservableVariable }]);
    private readonly _contentWindows: contentWindows = {
        leftWindow: permanent_oArr('ui.MainWindow._leftContentWindows', undefined, [{ key: 'z_index', type: ObservableVariable }]),
        rightWindow: permanent_oArr('ui.MainWindow._rightContentWindows', undefined, [{ key: 'z_index', type: ObservableVariable }]),
        focusedWindow: oVar<'left' | 'right'>('left')
    };

    private readonly _fileManagerNumber: fileManagerNumber = oVar(0);
    private readonly _serviceManagerErrorNumber: serviceManagerErrorNumber = oVar(0);

    componentDidMount() {
        this.watch(this.props.logged);
    }

    render() {
        if (this.props.logged.value) {
            return (
                <div id="MainWindow">
                    <SideBar
                        functionAreaDisplayType={this._functionAreaDisplayType}
                        showLogWindow={this._showLogWindow}
                        contentWindows={this._contentWindows}
                        fileManagerNumber={this._fileManagerNumber}
                        serviceManagerErrorNumber={this._serviceManagerErrorNumber} />
                    <FunctionArea
                        functionAreaDisplayType={this._functionAreaDisplayType}
                        fileManagerNumber={this._fileManagerNumber}
                        contentWindows={this._contentWindows}
                        serviceManagerErrorNumber={this._serviceManagerErrorNumber} />
                    <div className={less.right}>
                        <LogWindow showLogWindow={this._showLogWindow} openedLogWindows={this._logWindows} />
                    </div>
                </div>
            );
        } else
            return false;
    }
}