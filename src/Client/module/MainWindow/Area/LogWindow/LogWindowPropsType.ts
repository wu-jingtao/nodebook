import { ObservableVariable, ObservableArray } from "observable-variable";

/**
 * 是否显示日志窗口
 */
export type showLogWindow = ObservableVariable<boolean>;

/**
 * 要显示哪些任务的日志，传入任务的完整文件路径
 */
export type taskFilePathList = ObservableArray<string>;