import * as React from 'react';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { permanent_oVar } from '../../../../global/Tools/PermanentVariable';
import { LogWindowPropsType } from './LogWindowPropsType';

const less = require('./LogWindow.less');

/**
 * 日志窗口
 */
export class LogWindow extends ObservableComponent<LogWindowPropsType> {

    private readonly _height = permanent_oVar('ui.LogWindow._height', '200');   //日志窗口的高度

    componentDidMount() {
        this.watch(this._height, this.props.showLogWindow);
    }

    render() {
        return (
            <div id="LogWindow" style={{ height: this._height.value, display: this.props.showLogWindow.value ? 'block' : 'none' }}>
                <Splitter className={less.splitter} onChange={position => this._height.value = window.innerHeight - position} vertical />
            </div>
        );
    }
}   