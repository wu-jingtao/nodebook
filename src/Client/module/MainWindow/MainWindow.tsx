import * as React from 'react';
import { oVar, oArr, ObservableVariable, watch } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { debounce } from '../../global/Tools/Tools';
import { SideBar } from './Area/SideBar/SideBar';
import { functionAreaDisplayType } from './Area/FunctionArea/FunctionAreaPropsType';
import { showLogWindow, logWindows } from './Area/LogWindow/LogWindowPropsType';
import { contentWindows } from './Area/ContentWindow/ContentWindowPropsType';
import { fileManagerNumber, serviceManagerErrorNumber } from './Area/SideBar/SideBarPropsType';
import { FunctionArea } from './Area/FunctionArea/FunctionArea';
import { LogWindow } from './Area/LogWindow/LogWindow';

const less = require('./MainWindow.less');

/**
 * 程序的主窗体
 */
export class MainWindow extends ObservableComponent<{ logged: ObservableVariable<boolean> }> {

    private readonly _functionAreaDisplayType: functionAreaDisplayType = this._initProp(oVar, 'ui._functionAreaDisplayType', '"file"');
    private readonly _showLogWindow: showLogWindow = this._initProp(oVar, 'ui._showLogWindow', 'false');
    private readonly _logWindows: logWindows = this._initProp(oArr, 'ui._logWindows', '[]', [['z_index', oVar]]) as any;
    private readonly _contentWindows: contentWindows = {
        leftWindow: this._initProp(oArr, 'ui._leftContentWindows', '[]', [['z_index', oVar]]) as any,
        rightWindow: this._initProp(oArr, 'ui._rightContentWindows', '[]', [['z_index', oVar]]) as any,
        focusedWindow: oVar('left') as any
    };

    private readonly _fileManagerNumber: fileManagerNumber = oVar(0);
    private readonly _serviceManagerErrorNumber: serviceManagerErrorNumber = oVar(0);

    //初始化属性。从localStorage读取状态并配置如何保存状态
    private _initProp(type: (arg: any) => ObservableVariable<any>, savedName: string, defaultValue: string, observedProp: [string, (arg: any) => ObservableVariable<any>][] = []): ObservableVariable<any> {
        const _value: any = type(JSON.parse(localStorage.getItem(savedName) || defaultValue));
        const _saveChange = debounce(() => localStorage.setItem(savedName, JSON.stringify(_value)), 2000);
        watch([_value], _saveChange);

        if (type === oArr) {
            function watchProp(item: any) {
                observedProp.forEach(([propName, type]) => {
                    item[propName] = type(item[propName]);
                    watch([item[propName]], _saveChange);
                });
            }

            _value.forEach(watchProp);
            _value.on('add', watchProp);
        }

        return _value;
    }

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