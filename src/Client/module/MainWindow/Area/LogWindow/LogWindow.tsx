import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { permanent_oVar } from '../../../../global/Tools/PermanentVariable';

const less = require('./LogWindow.less');

export const showLogWindow: ObservableVariable<boolean> = permanent_oVar('ui.LogWindow._showLogWindow', 'false');

/**
 * 日志窗口
 */
export class LogWindow extends ObservableComponent {

    private readonly _height = permanent_oVar('ui.LogWindow._height', '200');   //日志窗口的高度

    componentDidMount() {
        this.watch(this._height, showLogWindow);
    }

    render() {
        return (
            <div id="LogWindow" style={{ height: this._height.value, display: showLogWindow.value ? 'block' : 'none' }}>
                <Splitter className={less.splitter} onChange={position => this._height.value = window.innerHeight - position} vertical />
            </div>
        );
    }
}   