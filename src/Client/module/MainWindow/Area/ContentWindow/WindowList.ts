import { permanent_oVar, permanent_oArr, ObservableArray, oVar, watch } from "observable-variable";
import isEqual = require('lodash.isequal');

import { WindowArgs, WindowType, PDFViewerWindowArgs, ImageViewerWindowArgs, VideoPlayerWindowArgs, MarkdownViewerWindowArgs, CodeEditorWindowArgs, HtmlViewerWindowArgs } from "./ContentWindowTypes";
import { showMessageBox } from "../../../MessageBox/MessageBox";

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

        focusWindow(args.id, _side)
    }
}

/**
 * 根据文件路径打开对应的窗口
 * @param path 文件路径
 * @param isBinary 是否是二进制文件
 * @param size 文件的大小
 * @param side 在哪一边显示，默认是处于焦点的一边
 * @param readonly 文本文件是否以只读方式打开
 * @param viewerFirst 对于某些文本文件是否优先使用查看器打开
 */
export function openWindowByFilePath(path: string, isBinary: boolean, size: number, side?: 'left' | 'right', readonly: boolean = false, viewerFirst?: boolean) {
    if (path.endsWith('.pdf')) {
        const winArgs: PDFViewerWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: `(查看) ${path.split('/').pop()}`,
            type: WindowType.pdf_viewer,
            args: { path }
        };

        openWindow(winArgs, side);
    } else if (/.(jpg|jpeg|jpe|jif|jfif|jfi|webp|gif|png|apng|svg|svgz|xbm|bmp|dib|ico)$/i.test(path)) {
        const winArgs: ImageViewerWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: `(查看) ${path.split('/').pop()}`,
            type: WindowType.image_viewer,
            args: { path }
        };

        openWindow(winArgs, side);
    } else if (/.(wav|mpeg|mp3|mp4|webm|aac|aacp|ogg|flac|rm|rmvb|3gp|avi|mpg|mov|mkv)$/i.test(path)) {
        const winArgs: VideoPlayerWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: `(查看) ${path.split('/').pop()}`,
            type: WindowType.video_player,
            args: { path }
        };

        openWindow(winArgs, side);
    } else if (!isBinary) {    //不是二进制文件就是用编辑器打开
        const openTextFile = () => {
            if (viewerFirst && path.endsWith('.html')) {
                const winArgs: HtmlViewerWindowArgs = {
                    id: Math.random().toString(),
                    fixed: oVar(false),
                    name: `(查看) ${path.split('/').pop()}`,
                    type: WindowType.html_viewer,
                    args: { path }
                };

                openWindow(winArgs, side);
            } else if (viewerFirst && path.endsWith('.md')) {
                const winArgs: MarkdownViewerWindowArgs = {
                    id: Math.random().toString(),
                    fixed: oVar(false),
                    name: `(查看) ${path.split('/').pop()}`,
                    type: WindowType.markdown_viewer,
                    args: { path, readonly }
                };

                openWindow(winArgs, side);
            } else {
                const winArgs: CodeEditorWindowArgs = {
                    id: Math.random().toString(),
                    fixed: oVar(false),
                    name: path.split('/').pop() as string,
                    type: WindowType.code_editor,
                    args: { path, readonly }
                };

                openWindow(winArgs, side);
            }
        };

        if (size > 5 * 1024 * 1024) {
            showMessageBox({
                icon: 'question',
                title: '文件大小过大，确定要打开吗?',
                content: `文件大小: ${(size / 1024 / 1024).toFixed(2)}MB。\n文件名：${path}`,
                buttons: {
                    ok: { callback: openTextFile },
                    cancel: { callback() { } }
                }
            });
        } else
            openTextFile();
    }
}

/**
 * 关闭指定窗口
 */
export function closeWindow(id: string, side: 'left' | 'right'): void {
    const _thisSide = side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    const _closeIndex = _thisSide.windowList.findIndex(item => item.id === id);

    if (_closeIndex !== -1) {
        _thisSide.windowList.splice(_closeIndex, 1);
        _thisSide.displayOrder.delete(id);

        if (_thisSide.windowList.length === 0) {
            const _otherSide = side === 'left' ? windowList.rightWindows : windowList.leftWindows;
            if (_otherSide.windowList.length > 0)
                windowList.focusedSide.value = side === 'left' ? 'right' : 'left';
            else
                windowList.focusedSide.value = null;
        }
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
 * 根据 WindowArgs.args.path 来关闭窗口
 * @param descendants 是否包含后代，这个主要是针对于文件夹
 * @param types 关闭指定类型的窗口
 */
export function closeWindowByPath(path: string, descendants?: boolean, types?: WindowType[]): void {
    if (descendants) path += '/'; //在路径的末尾加上'/'是为了避免误把同级同名文件误认为子级文件的情况

    const win: { id: string, side: 'left' | 'right' }[] = [];

    for (const item of windowList.leftWindows.windowList.value) {
        if (item.args.path && (types === undefined || types.includes(item.type))) {
            if (descendants) {
                if (item.args.path.startsWith(path))
                    win.push({ id: item.id, side: 'left' });
            } else {
                if (item.args.path === path)
                    win.push({ id: item.id, side: 'left' });
            }
        }
    }

    for (const item of windowList.rightWindows.windowList.value) {
        if (item.args.path && (types === undefined || types.includes(item.type))) {
            if (descendants) {
                if (item.args.path.startsWith(path))
                    win.push({ id: item.id, side: 'right' });
            } else {
                if (item.args.path === path)
                    win.push({ id: item.id, side: 'right' });
            }
        }
    }

    win.forEach(({ id, side }) => closeWindow(id, side));
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