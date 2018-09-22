import * as React from 'react';
import { oVar, ObservableVariable, oArr } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { WindowContainer } from './WindowContainer';

const less = require('./ContentWindow.less');

/**
 * 窗口列表
 */
export const windowList = {
    leftWindows: oArr<{ name: string, type: 'file' | 'task' | 'service' | 'setting', fixed: ObservableVariable<boolean> }>([]),
    rightWindows: oArr<{ name: string, type: 'file' | 'task' | 'service' | 'setting', fixed: ObservableVariable<boolean> }>([]),
    focusedWindow: oVar<{ name: string, type: 'file' | 'task' | 'service' | 'setting', side: 'left' | 'right' } | undefined>(undefined)
}

/**
 * 打开一个新的窗口
 * @param name 窗口的标题。file类型需要是文件的全路径
 * @param type 窗口的类型
 * @param fixed 该窗口是否不是临时窗口
 * @param side 在哪一边显示，默认是处于焦点的一边
 */
export function openWindow(name: string, type: 'file' | 'task' | 'service' | 'setting', fixed?: boolean, side?: 'left' | 'right'): void {
    //找出现在焦点所在的一边
    side = side || (windowList.focusedWindow.value ? windowList.focusedWindow.value.side : 'left');

    const focusedSide = side === 'right' ? windowList.rightWindows : windowList.leftWindows;

    //查找是否有已经打开的窗口
    const openedWindow = focusedSide.find(item => item.type === type && item.name === name);

    if (openedWindow) //如果之前打开过，那么就把该窗口改为固定窗口
        openedWindow.fixed.value = true;
    else {
        const window = { name, type, fixed: oVar(!!fixed) };

        //查找是否有临时窗口
        const tempWindowIndex = focusedSide.findIndex(item => item.fixed.value === false);

        if (tempWindowIndex !== -1) //如果有临时窗口就替换
            focusedSide.splice(tempWindowIndex, 1, window);
        else
            focusedSide.push(window);
    }

    windowList.focusedWindow.value = { name, type, side };
}

/**
 * 关闭窗口
 * @param side 关闭那一侧的窗口
 */
export function closeWindow(name: string, type: 'file' | 'task' | 'service' | 'setting', side: 'left' | 'right'): void {
    const closeSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    const closeWindowIndex = closeSide.findIndex(item => item.name === name && item.type === type);
    if (closeWindowIndex !== -1)
        closeSide.splice(closeWindowIndex, 1);
}

/**
 * 将窗口移动到另一侧显示
 * @param side 现在的窗口是位于哪一边
 */
export function moveToOtherSide(name: string, type: 'file' | 'task' | 'service' | 'setting', side: 'left' | 'right'): void {
    const thisSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    const otherSide = side === 'left' ? windowList.rightWindows : windowList.leftWindows;

    const moveWindowIndex = thisSide.findIndex(item => item.name === name && item.type === type);
    if (moveWindowIndex !== -1) {
        const moveWindow = thisSide.splice(moveWindowIndex, 1)[0];

        const duplicateWindow = otherSide.findIndex(item => item.name === name && item.type === type);
        if (duplicateWindow === -1)
            otherSide.push(moveWindow);

        windowList.focusedWindow.value = { name, type, side: side === 'left' ? 'right' : 'left' };
    }
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

        if (windowList.rightWindows.length > 0)
            rightStyle = { flexBasis: this._rightWidth.value };
        else {
            rightStyle = { display: 'none' };
            //确保下次打开右侧窗口的时候，分隔条是位于正中的位置
            this._rightWidth.value = '50%';
        }

        return (
            <div id="ContentWindow">
                <div className={less.left}>
                    <WindowContainer position="left" />
                </div>
                <div className={less.right} style={rightStyle}>
                    <Splitter className={less.splitter} vertical
                        onChange={position => this._rightWidth.value = window.innerWidth - position + 'px'} />
                    <WindowContainer position="right" />
                </div>
            </div>
        );
    }
}