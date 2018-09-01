import { ObservableVariable, ObservableArray } from "observable-variable";

/**
 * 是否显示日志窗口
 */
export type showLogWindow = ObservableVariable<boolean>;

/**
 * 要显示哪些任务的日志。
 */
export type logWindows = ObservableArray<{
    /**
     * 任务的完整文件路径
     */
    path: string,
    /**
     * 显示的优先级
     */
    z_index: ObservableVariable<number>
}>;

/**
 * 找出最大的z_index，并+1
 */
export function topLogWindowIndex(windowArray: logWindows): number {
    return windowArray.reduce((pre, cur) => pre > cur.z_index.value ? pre : cur.z_index.value, 0) + 1;
}

export type LogWindowPropsType = {
    showLogWindow: showLogWindow,
    openedLogWindows: logWindows
};