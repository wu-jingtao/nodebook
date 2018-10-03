import { permanent_oVar, permanent_oArr, ObservableArray, oVar, watch } from "observable-variable";
import isEqual = require('lodash.isequal');

import { WindowArgs } from "./ContentWindowTypes";

//WindowList初始化方法
function init(value: WindowArgs[], save: () => void, oArr: ObservableArray<WindowArgs>): WindowArgs[] {
    value.forEach(item => {
        oVar(item, 'fixed');    //反序列化后fixed将是boolean类型
        watch([item.fixed], save);
    });

    oArr.on('add', item => watch([item.fixed], save));
    oArr.on('update', item => watch([item.fixed], save));

    return value;
}

export const windowList = {
    /**
     * 在左侧打开的窗口
     */
    leftWindows: {
        /**
         * 要显示的窗口列表
         */
        windowList: permanent_oArr<WindowArgs>('ui.WindowList.leftWindows', { init }),
        /**
         * 窗口的显示顺序，排在后面的优先显示。value是窗口的id
         */
        displayOrder: permanent_oArr<string>('ui.WindowList.leftWindows.displayOrder')
    },
    /**
     * 在右侧打开的窗口
     */
    rightWindows: {
        /**
         * 要显示的窗口列表
         */
        windowList: permanent_oArr<WindowArgs>('ui.WindowList.rightWindows', { init }),
        /**
         * 窗口的显示顺序，排在后面的优先显示。value是窗口的id
         */
        displayOrder: permanent_oArr<string>('ui.WindowList.rightWindows.displayOrder')
    },
    /**
     * 目前哪一边窗口具有焦点
     */
    focusedSide: permanent_oVar<'left' | 'right' | null>('ui.WindowList.focusedSide', { defaultValue: null })
};

/**
 * 使某个窗口获取焦点
 */
export function focusWindow(id: string, side: 'left' | 'right'): void {
    const _focusedSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    
    if (_focusedSide.displayOrder.last !== id) {
        _focusedSide.displayOrder.delete(id);
        _focusedSide.displayOrder.push(id);
    }

    windowList.focusedSide.value = side;
}

/**
 * 打开一个新的窗口
 * @param side 在哪一边显示，默认是处于焦点的一边
 */
export function openWindow(args: WindowArgs, side?: 'left' | 'right'): void {
    //找出现在焦点所在的一边
    const _side = side || windowList.focusedSide.value || 'left';
    const _focusedSide = _side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    //查找是否有已经打开的窗口
    const _openedWindow = _focusedSide.windowList.find(item =>
        item.type === args.type && item.name === args.name && isEqual(item.args, args.args));

    if (_openedWindow) {    //如果之前打开过，那么就把该窗口改为固定窗口
        _openedWindow.fixed.value = true;
        focusWindow(_openedWindow.id, _side);
    } else {
        //查找是否有未固定窗口
        const tempWindowIndex = _focusedSide.windowList.findIndex(item => item.fixed.value === false);

        if (tempWindowIndex !== -1) {    //如果有未固定窗口就替换
            const tempWindow = _focusedSide.windowList.get(tempWindowIndex);
            _focusedSide.windowList.set(tempWindowIndex, args);
            _focusedSide.displayOrder.delete(tempWindow.id);
        } else
            _focusedSide.windowList.push(args);

        focusWindow(args.id, _side);
    }
}

/**
 * 关闭指定窗口
 */
export function closeWindow(id: string, side: 'left' | 'right'): void {
    const _focusedSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    const _closeIndex = _focusedSide.windowList.findIndex(item => item.id === id);
    if (_closeIndex !== -1) {
        _focusedSide.windowList.splice(_closeIndex, 1);
        _focusedSide.displayOrder.delete(id);
    }
}

/**
 * 关闭所有窗口
 * @param side 关闭哪一边的窗口，如果为空则关闭两边所有窗口
 */
export function closeAllWindow(side?: 'left' | 'right'): void {
    if (side == null || side === 'left') {
        windowList.leftWindows.displayOrder.length = 0;
        windowList.leftWindows.windowList.length = 0;
    }

    if (side == null || side === 'right') {
        windowList.rightWindows.displayOrder.length = 0;
        windowList.rightWindows.windowList.length = 0;
    }

    windowList.focusedSide.value = windowList.leftWindows.windowList.length > 0 ? 'left' :
        windowList.rightWindows.windowList.length > 0 ? 'right' : null;
}

/**
 * 关闭除指定窗口外的其他窗口
 */
export function closeOtherWindow(id: string, side: 'left' | 'right'): void {
    const _thisSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    const _otherWindows = _thisSide.windowList.filter(item => item.id !== id);
    _otherWindows.forEach(item => closeWindow(item.id, side));
}

/**
 * 将窗口移动到另一侧显示
 */
export function moveToOtherSide(id: string, side: 'left' | 'right'): void {
    const _thisSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    const _otherSide = side === 'left' ? windowList.rightWindows : windowList.leftWindows;

    const _moveWindowIndex = _thisSide.windowList.findIndex(item => item.id === id);

    if (_moveWindowIndex !== -1) {
        const _moveWindow = _thisSide.windowList.splice(_moveWindowIndex, 1)[0];
        _thisSide.displayOrder.delete(_moveWindow.id);

        const duplicatedWindowIndex = _otherSide.windowList.findIndex(item =>
            item.type === _moveWindow.type && item.name === _moveWindow.name && isEqual(item.args, _moveWindow.args));

        if (duplicatedWindowIndex === -1) {
            _otherSide.windowList.push(_moveWindow);
            focusWindow(_moveWindow.id, side === 'left' ? 'right' : 'left');
        } else {
            const duplicatedWindow = _otherSide.windowList.get(duplicatedWindowIndex);
            focusWindow(duplicatedWindow.id, side === 'left' ? 'right' : 'left');
            if (_moveWindow.fixed.value)
                duplicatedWindow.fixed.value = true;
        }
    }
}