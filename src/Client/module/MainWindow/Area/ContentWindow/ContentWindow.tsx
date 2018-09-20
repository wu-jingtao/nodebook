import * as React from 'react';
import { oMap, oVar } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { WindowContainer } from './WindowContainer';
import { WindowType, WindowList } from './WindowType';

const less = require('./ContentWindow.less');

/**
 * 窗口列表
 */
export const windowList: WindowList = {
    leftWindows: oMap<string, WindowType>([]),
    rightWindows: oMap<string, WindowType>([]),
    focusedWindow: oVar<string | undefined>(undefined)
};

/**
 * 打开一个新的窗口。返回窗口所对应的随机ID
 */
export function openWindow(config: WindowType): string {
    const id = Math.random().toString();

    //判断焦点是否位于右侧
    if (windowList.rightWindows.has(windowList.focusedWindow.value as any))
        windowList.rightWindows.set(id, config);
    else
        windowList.leftWindows.set(id, config);

    windowList.focusedWindow.value = id;
    return id;
}

/**
 * 内容窗口
 */
export class ContentWindow extends ObservableComponent {

    /**
     * 右侧窗口的宽度
     */
    private readonly _rightWidth = oVar('50%');

    componentDidMount() {
        this.watch(windowList.rightWindows, this._rightWidth);
    }

    render() {
        let rightStyle: React.CSSProperties;

        if (windowList.rightWindows.size > 0)
            rightStyle = { flexBasis: this._rightWidth.value };
        else {
            rightStyle = { display: 'none' };
            //确保下次打开右侧窗口的时候，分隔条是位于正中的位置
            this._rightWidth.value = '50%';
        }

        return (
            <div id="ContentWindow">
                <div className={less.left}>
                    <WindowContainer position="left" windowList={windowList} />
                </div>
                <div className={less.right} style={rightStyle}>
                    <Splitter className={less.splitter} vertical
                        onChange={position => this._rightWidth.value = window.innerWidth - position + 'px'} />
                    <WindowContainer position="right" windowList={windowList} />
                </div>
            </div>
        );
    }
}