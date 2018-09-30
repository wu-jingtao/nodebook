import * as React from 'react';
import { oVar, permanent_oArr, permanent_oVar } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { WindowContainer } from './WindowContainer';
import { WindowList, Window, OpenWindowArgs, CloseMoveWindowArgs } from './ContentWindowTypes';

const less = require('./ContentWindow.less');

/**
 * 打开的窗口列表
 */
export const windowList: WindowList = {
    leftWindows: permanent_oArr('ui.ContentWindow.leftWindows'),
    rightWindows: permanent_oArr('ui.ContentWindow.rightWindows'),
    focusedWindow: permanent_oVar<any>('ui.ContentWindow.focusedWindow', { defaultValue: null })
}

//转换fixed的类型
windowList.leftWindows.forEach(item => oVar(item, 'fixed'));
windowList.rightWindows.forEach(item => oVar(item, 'fixed'));

/**
 * 打开一个新的窗口
 * @param side 在哪一边显示，默认是处于焦点的一边
 */
export function openWindow(args: OpenWindowArgs): void {
    //找出现在焦点所在的一边
    const side = args.side || (windowList.focusedWindow.value ? windowList.focusedWindow.value.side : 'left');
    const focusedSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    //查找是否有已经打开的窗口
    const openedWindow = focusedSide.find(item => item.type === args.type && item.name === args.name);

    if (openedWindow) //如果之前打开过，那么就把该窗口改为固定窗口
        openedWindow.fixed.value = true;
    else {
        //查找是否有临时窗口
        const tempWindowIndex = focusedSide.findIndex(item => item.fixed.value === false);
        const window: Window = { name: args.name, type: args.type, fixed: oVar(!!args.fixed), args: args.args || {} };

        if (tempWindowIndex !== -1) //如果有临时窗口就替换
            focusedSide.set(tempWindowIndex, window);
        else
            focusedSide.push(window);
    }

    windowList.focusedWindow.value = { name: args.name, type: args.type, side };
}

/**
 * 关闭窗口
 */
export function closeWindow(args: CloseMoveWindowArgs): void {
    const closeSide = args.side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    const closeWindowIndex = closeSide.findIndex(item => item.type === args.type && item.name === args.name);
    if (closeWindowIndex !== -1)
        closeSide.splice(closeWindowIndex, 1);
}

/**
 * 将窗口移动到另一侧显示
 */
export function moveToOtherSide(args: CloseMoveWindowArgs): void {
    const thisSide = args.side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    const otherSide = args.side === 'left' ? windowList.rightWindows : windowList.leftWindows;

    const moveWindowIndex = thisSide.findIndex(item => item.type === args.type && item.name === args.name);
    if (moveWindowIndex !== -1) {
        const moveWindow = thisSide.splice(moveWindowIndex, 1)[0];

        const duplicatedWindow = otherSide.findIndex(item => item.type === args.type && item.name === args.name);
        if (duplicatedWindow === -1)
            otherSide.push(moveWindow);

        windowList.focusedWindow.value = { name: args.name, type: args.type, side: args.side === 'left' ? 'right' : 'left' };
    }
}

/**
 * 内容窗口
 */
export class ContentWindow extends ObservableComponent {
    //右侧窗口的宽度
    private readonly _rightWidth = oVar('50%');

    componentDidMount() {
        this.watch(windowList.leftWindows, windowList.rightWindows, this._rightWidth);
    }

    render() {
        return (
            <div id="ContentWindow">
                <div className={less.left} style={{ display: windowList.leftWindows.length > 0 ? 'block' : 'none' }}>
                    <WindowContainer position="left" />
                </div>
                <Splitter className={less.splitter}
                    style={{ display: windowList.leftWindows.length > 0 && windowList.rightWindows.length > 0 ? 'block' : 'none' }}
                    onChange={position => this._rightWidth.value = window.innerWidth - position + 'px'} />
                <div className={less.right} style={{
                    display: windowList.rightWindows.length > 0 ? 'block' : 'none',
                    flexBasis: windowList.leftWindows.length > 0 ? this._rightWidth.value : '100%',
                }}>
                    <WindowContainer position="right" />
                </div>
            </div>
        );
    }
}