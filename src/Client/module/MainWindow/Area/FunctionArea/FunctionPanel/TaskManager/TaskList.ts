import { ObservableVariable, oMap, oArr, oVar } from 'observable-variable';

import { ServerApi } from '../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { selectFile } from '../ShortcutManager/SelectFile/SelectFile';

/**
 * 任务列表。key是运行文件的绝对路径，value是当前任务的运行状态。当某个任务不存在的时候会触发remove事件
 */
export const taskList = oMap<string, ObservableVariable<'running' | 'stop' | 'crashed'>>([]);

/**
 * 内部使用，表示正在处理中的任务
 */
export const _processingTask = oArr<string>([]);

/**
 * 创建新的任务
 * @param filePath 运行文件的绝对路径
 */
export async function createTask(filePath?: string): Promise<void> {
    try {
        filePath = filePath || await selectFile(/\.server\.js$/);

        if (filePath && (!taskList.has(filePath) || taskList.get(filePath).value !== 'running')) {
            _processingTask.push('任务列表');   //任务列表的根显示加载动画
            await ServerApi.task.createTask(filePath);
            refreshTaskList();
        }
    } catch (error) {
        showMessageBox({ icon: 'error', title: '创建任务失败', content: error.message });
    } finally {
        _processingTask.delete('任务列表');
    }
}

/**
 * 启动任务
 */
export async function startTask(filePath: string): Promise<void> {
    const taskStatus = taskList.get(filePath);

    if (taskStatus && taskStatus.value !== 'running' && !_processingTask.includes(filePath)) {
        try {
            _processingTask.push(filePath);
            await ServerApi.task.createTask(filePath);
            taskStatus.value = await ServerApi.task.getTaskStatus(filePath) || 'stop';
        } catch (error) {
            showMessageBox({ icon: 'error', title: '启动任务失败', content: error.message });
        } finally {
            _processingTask.delete(filePath);
        }
    }
}

/**
 * 停止任务
 */
export async function stopTask(filePath: string): Promise<false | void> {
    const taskStatus = taskList.get(filePath);

    if (taskStatus && taskStatus.value === 'running' && !_processingTask.includes(filePath)) {
        try {
            _processingTask.push(filePath);
            await ServerApi.task.destroyTask(filePath);
            taskStatus.value = await ServerApi.task.getTaskStatus(filePath) || 'stop';
        } catch (error) {
            showMessageBox({ icon: 'error', title: '停止任务失败', content: error.message });
            return false;
        } finally {
            _processingTask.delete(filePath);
        }
    }
}

/**
 * 重启任务
 */
export async function restartTask(filePath: string): Promise<void> {
    if (taskList.has(filePath)) {
        if (await stopTask(filePath) !== false)
            await startTask(filePath);
    }
}

/**
 * 刷新任务列表
 */
export async function refreshTaskList(): Promise<false | void> {
    try {
        _processingTask.push('任务列表');

        const data = await ServerApi.task.getAllTaskStatus();

        //删除已经不再存在的任务
        for (const path of taskList.keys()) {
            if (data.every(item => item.path !== path))
                taskList.delete(path);
        }

        //更新或添加任务
        for (const item of data) {
            if (taskList.has(item.path))
                taskList.get(item.path).value = item.status;
            else
                taskList.set(item.path, oVar(item.status));
        }
    } catch (error) {
        showMessageBox({ icon: 'error', title: '刷新任务列表失败', content: error.message });
        return false;
    } finally {
        _processingTask.delete('任务列表');
    }
}