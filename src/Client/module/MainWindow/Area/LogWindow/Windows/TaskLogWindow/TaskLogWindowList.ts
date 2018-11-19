import { oVar, oArr } from "observable-variable";

/**
 * 任务窗口列表，value是任务文件的绝对路径
 */
export const taskLogWindowList = oArr<string>([]);

/**
 * 目前处于焦点中的任务日志窗口
 */
export const focusedTaskLogWindow = oVar('');

/**
 * 打开对应任务的日志
 * @param taskFilePath 任务文件的路径
 */
export function openTaskLogWindow(taskFilePath: string): void {
    if (!taskLogWindowList.includes(taskFilePath)) 
        taskLogWindowList.push(taskFilePath);
    focusedTaskLogWindow.value = taskFilePath;
}