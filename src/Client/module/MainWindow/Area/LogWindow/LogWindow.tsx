import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { LogWindowPropsType } from './LogWindowPropsType';

const less = require('./LogWindow.less');

/**
 * 日志窗口
 */
export class LogWindow extends ObservableComponent<LogWindowPropsType> {

    private readonly _height = oVar(200);   //日志窗口的高度

    componentDidMount() {
        this.watch(this._height, this.props.showLogWindow);
    }

    render() {
        return (
            <div id="LogWindow" style={{ height: this._height.value, display: this.props.showLogWindow.value ? 'block' : 'none' }}>
                <Splitter className={less.splitter} position={this._height} referenceFlip vertical />
            </div>
        );
    }
}   