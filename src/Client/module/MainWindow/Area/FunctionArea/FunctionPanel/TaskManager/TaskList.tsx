import { oMap, ObservableVariable, ObservableArray, oVar, oArr } from "observable-variable";

import { ServerApi } from "../../../../../../global/ServerApi";
import { showMessageBox } from "../../../../../MessageBox/MessageBox";

export interface Task {
    /**
     * 任务的运行状态
     */
    status: ObservableVariable<'running' | 'stop' | 'crashed'>,
    /**
     * 任务的日志。添加日志会触发add事件，清空日志会触发set事件。
     */
    logs: ObservableArray<{ date: number, is_error: boolean, text: string }>,
    /**
     * 是否自动刷新任务日志，默认false
     */
    refresh: ObservableVariable<boolean>
}

/**
 * 任务列表。key是运行文件的绝对路径。当某个任务不存在的时候会触发remove事件
 */
export const taskList = oMap<string, Task>([]);

/**
 * 清空某个任务的日志
 * @param path 任务文件的完整路径
 */
export async function cleanTaskLogger(path: string): Promise<void> {
    if (taskList.has(path)) {
        try {
            await ServerApi.task.cleanTaskLogger(path);
            taskList.get(path).logs.value = [];
        } catch (error) {
            showMessageBox({ icon: 'error', title: '清空任务日志失败', content: `任务：${path}。${error.message}` });
        }
    }
}

/**
 * 刷新任务列表
 */
export async function refreshTaskList(): Promise<void> {
    try {
        const data = await ServerApi.task.getAllTaskStatus();

        //删除已经不再存在的任务
        for (const path of taskList.keys()) {
            if (data.every(item => item.path !== path))
                taskList.delete(path);
        }

        //更新或添加任务
        for (const item of data) {
            if (taskList.has(item.path))
                taskList.get(item.path).status.value = item.status;
            else {
                const task: Task = { status: oVar(item.status), logs: oArr<any>([]), refresh: oVar(false) };

                //#region 设置自动更新日志

                //计时器
                let timer: any;

                //清除计时器
                function removeTimer() { clearInterval(timer) }

                //配置计时器
             




                //#endregion



                taskList.set(item.path, task);
            }
        }
    } catch (error) {
        showMessageBox({ icon: 'error', title: '刷新任务列表失败', content: error.message });
    }
}