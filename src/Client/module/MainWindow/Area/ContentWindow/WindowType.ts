import * as React from 'react';
import { ObservableMap, ObservableVariable } from 'observable-variable';

export interface WindowType {
    /**
     * 窗口的标题
     */
    title: string;

    /**
     * 需要显示的图标。宽高25px
     */
    icon: JSX.Element;

    /**
     * 标题栏右侧的功能按钮组。每个按钮宽高30px
     */
    functionButtons: React.ReactFragment;

    /**
     * 要显示的内容
     */
    content: JSX.Element;

    /**
     * 关闭窗口事件，返回false阻止关闭
     */
    onClose: () => Promise<void | false>
}

export interface WindowList {
    /**
     * 左侧显示的窗口。key是随机ID
     */
    leftWindows: ObservableMap<string, WindowType>;
    /**
     * 右侧显示的窗口。key是随机ID
     */
    rightWindows: ObservableMap<string, WindowType>;
    /**
     * 处于焦点下的窗口。value是随机ID
     */
    focusedWindow: ObservableVariable<string | undefined>;
}