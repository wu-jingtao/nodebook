import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { WindowContainer } from './WindowContainer';
import { windowList } from './WindowList';

const less = require('./ContentWindow.less');

/**
 * 内容窗口
 */
export class ContentWindow extends ObservableComponent {
    //右侧窗口的宽度
    private readonly _rightWidth = oVar('50%');

    private _ref: HTMLDivElement;

    componentDidMount() {
        this.watch([windowList.leftWindows.windowList, windowList.rightWindows.windowList, this._rightWidth]);
    }

    render() {
        return (
            <div id="ContentWindow" ref={(e: any) => this._ref = e}>
                <div className={less.left} style={{
                    display: windowList.leftWindows.windowList.length > 0 ? 'block' : 'none',
                    maxWidth: windowList.rightWindows.windowList.length > 0 ? '90%' : '',
                }}>
                    <WindowContainer side="left" />
                </div>
                <Splitter className={less.splitter}
                    style={{
                        display: windowList.leftWindows.windowList.length > 0 &&
                            windowList.rightWindows.windowList.length > 0 ? 'block' : 'none'
                    }}
                    onChange={position => this._rightWidth.value = (window.innerWidth - position) / this._ref.clientWidth + '%'} />
                <div className={less.right} style={{
                    display: windowList.rightWindows.windowList.length > 0 ? 'block' : 'none',
                    flexBasis: windowList.leftWindows.windowList.length > 0 ? this._rightWidth.value : '100%',
                    maxWidth: windowList.leftWindows.windowList.length > 0 ? '90%' : '',
                }}>
                    <WindowContainer side="right" />
                </div>
            </div>
        );
    }
}