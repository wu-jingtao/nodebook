import { ObservableArray, ObservableVariable } from "observable-variable";

/**
 * 打开的窗口列表
 */
export type windows = ObservableArray<{
    /**
     * 窗口的标题
     */
    title: string,
    /**
     * 需要显示的文件图标
     */
    icon: string,
    /**
     * 窗口的唯一id
     */
    id: string,
    /**
     * 窗口层叠的排序
     */
    z_index: ObservableVariable<number>,
    /**
     * 组件类
     */
    component: React.ComponentClass,
    /**
     * 向component传递的props
     */
    props: { [key: string]: any },
    /**
     * 程序内部使用的，用于附加一些额外信息
     */
    _tag: any
}>;

/**
 * 找出最大的z_index，并+1
 */
export function topWindowIndex(windowArray: windows): number {
    return windowArray.reduce((pre, cur) => pre > cur.z_index.value ? pre : cur.z_index.value, 0) + 1;
}

export type contentWindows = {
    leftWindow: windows,
    rightWindow: windows,
    focusedWindow: ObservableVariable<'left' | 'right'>
};