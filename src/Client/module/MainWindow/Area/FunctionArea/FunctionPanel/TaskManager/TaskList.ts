import clipboard from 'copy-text-to-clipboard';
import { ObservableVariable, oMap, oArr, oVar } from 'observable-variable';

import { ServerApi } from '../../../../../../global/ServerApi';
import { showMessageBox, closeMessageBox } from '../../../../../MessageBox/MessageBox';
import { selectFile } from '../ShortcutManager/SelectFile/SelectFile';

/**
 * 任务列表。key是运行文件的绝对路径，value是当前任务的运行状态。当某个任务不存在的时候会触发remove事件
 */
export const taskList = oMap<string, ObservableVariable<'running' | 'debugging' | 'stop' | 'crashed'>>([]);

/**
 * 内部使用，表示正在处理中的任务
 */
export const _processingTask = oArr<string>([]);

async function _inner_createTask(filePath: string, debug?: boolean): Promise<void> {
    const port = await ServerApi.task.createTask(filePath, debug);

    if (debug) {
        const content = `chrome-devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&wss=${window.location.host}/task/debugProxy?port=${port}`;

        const id = showMessageBox({
            icon: 'message',
            title: '复制链接地址，在当前浏览器的新标签页中打开',
            content,
            autoClose: 60,
            buttons: {
                ok: {
                    name: '复制',
                    callback() {
                        if (!clipboard(content)) {
                            showMessageBox({ icon: 'message', title: '复制调试地址失败，请手动复制' });
                        } else {
                            closeMessageBox(id);
                        }
                    }
                },
                cancel: {
                    name: '关闭',
                    callback() { }
                }
            }
        });
    }
}

/**
 * 创建新的任务
 * @param filePath 运行文件的绝对路径
 * @param debug 是否以调试模式打开
 */
export async function createTask(filePath?: string, debug?: boolean): Promise<void> {
    try {
        filePath = filePath || await selectFile(/\.server\.js$/);
        const taskStatus = taskList.get(filePath);

        if (filePath && (!taskStatus || (taskStatus.value !== 'running' && taskStatus.value !== 'debugging'))) {
            _processingTask.push('任务列表');   //任务列表的根显示加载动画
            await _inner_createTask(filePath, debug);

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
 * @param debug 是否以调试模式打开
 */
export async function startTask(filePath: string, debug?: boolean): Promise<void> {
    const taskStatus = taskList.get(filePath);

    if (taskStatus && taskStatus.value !== 'running' && taskStatus.value !== 'debugging' && !_processingTask.includes(filePath)) {
        try {
            _processingTask.push(filePath);
            await _inner_createTask(filePath, debug);

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

    if (taskStatus && (taskStatus.value === 'running' || taskStatus.value === 'debugging') && !_processingTask.includes(filePath)) {
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
 * @param debug 是否以调试模式重启，如果不设置，之前是调试模式，重启后也进入调试模式
 */
export async function restartTask(filePath: string, debug?: boolean): Promise<void> {
    if (taskList.has(filePath)) {
        const isDebug = debug !== undefined ? debug : taskList.get(filePath).value === 'debugging';
        if (await stopTask(filePath) !== false)
            await startTask(filePath, isDebug);
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