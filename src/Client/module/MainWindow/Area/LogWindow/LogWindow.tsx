import * as React from 'react';
import { ObservableVariable, permanent_oVar } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';

const less = require('./LogWindow.less');

/**
 * 是否显示日志窗口
 */
export const showLogWindow = permanent_oVar('ui.LogWindow._showLogWindow', { defaultValue: false });

/**
 * 日志窗口
 */
export class LogWindow extends ObservableComponent {

    private readonly _height = permanent_oVar('ui.LogWindow._height', { defaultValue: 200 });   //日志窗口的高度

    componentDidMount() {
        this.watch(this._height, showLogWindow);
    }

    render() {
        return (
            <div id="LogWindow" style={{ flexBasis: this._height.value, display: showLogWindow.value ? 'block' : 'none' }}>
                <Splitter className={less.splitter} onChange={position => this._height.value = window.innerHeight - position} vertical />
            </div>
        );
    }
}   