import * as React from 'react';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { oVar } from 'observable-variable';

const less = require('./LogWindow.less');

/**
 * 日志窗口
 */
export class LogWindow extends ObservableComponent {

    private readonly _height = oVar(200);   //日志窗口的高度

    componentDidMount() {
        this.watch(this._height);
    }

    render() {
        return (
            <div id="LogWindow" style={{ height: this._height.value }}>
                <Splitter className={less.splitter} position={this._height} referenceFlip vertical />
            </div>
        );
    }
}   