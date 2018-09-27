import { ObservableVariable, ObservableArray } from "observable-variable";

export interface Window {
    name: string;
    type: 'file' | 'task' | 'service' | 'setting';
    fixed: ObservableVariable<boolean>;
    args: { [key: string]: any };
}

export interface WindowList {
    /**
     * 在左侧打开的窗口
     */
    leftWindows: ObservableArray<Window>;

    /**
     * 在右侧打开的窗口
     */
    rightWindows: ObservableArray<Window>;

    /**
     * 目前处于焦点的窗口
     */
    focusedWindow: ObservableVariable<{ name: string, type: 'file' | 'task' | 'service' | 'setting', side: 'left' | 'right' } | null>;
}

/**
 * 打开窗口方法的参数类型
 */
export interface OpenWindowArgs {
    /**
     * 窗口的名称。file类型需要是文件的全路径
     */
    name: string;

    /**
     * 窗口的类型
     */
    type: 'file' | 'task' | 'service' | 'setting';

    /**
     * 是在左边打开还是右边打开，默认是处于焦点的一边
     */
    side?: 'left' | 'right';

    /**
     * 窗口是否固定。默认最开始是未固定。如果用户打开新窗口时存在未固定的旧窗口，则会先关闭未固定的旧窗口，再打开新窗口。
     * 如果用户打开相同的窗口两次，则该窗口会自动变为固定窗口。
     */
    fixed?: boolean;

    /**
     * 额外的参数供打开的窗口使用。
     */
    args?: { [key: string]: any };
}

/**
 * 关闭或移动窗口方法的参数类型
 */
export interface CloseMoveWindowArgs {
    name: string;
    type: 'file' | 'task' | 'service' | 'setting';

    /**
     * 目前窗口是在哪一边
     */
    side: 'left' | 'right';
}