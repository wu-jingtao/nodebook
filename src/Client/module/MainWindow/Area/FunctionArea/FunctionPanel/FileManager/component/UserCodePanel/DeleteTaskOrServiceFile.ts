import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { taskList } from '../../../TaskManager/TaskList';
import { serviceList } from '../../../ServiceManager/ServiceManager';

/**
 * 检测给定路径下是否有正在运行的任务或服务文件
 * @param descendants 是否包含后代，主要是针对文件夹
 */
export async function checkTaskOrServiceFile(path: string, action: 'delete' | 'cut', descendants?: boolean) {
    return await checkService(path, action, descendants) && await checkTask(path, action, descendants);
}

export async function checkTask(path: string, action: 'delete' | 'cut', descendants?: boolean) {
    return new Promise(resolve => {
        let taskFile: string[] = [];

        if (descendants) {
            taskList.forEach((status, taskPath) => {
                if (status.value === 'running' && taskPath.startsWith(path))
                    taskFile.push(taskPath);
            });
        } else {
            if (taskList.has(path) && taskList.get(path).value === 'running')
                taskFile.push(path);
        }

        if (taskFile.length > 0) {
            showMessageBox({
                icon: 'warning',
                title: `检测到以下文件正在任务中运行，无法${action === 'delete' ? '删除' : '剪切'}`,
                content: taskFile.join('\n')
            });
            resolve(false);
        } else
            resolve(true);
    });
}

export async function checkService(path: string, action: 'delete' | 'cut', descendants?: boolean) {
    return new Promise(resolve => {
        let serviceFile: { name: string, path: string }[] = [];

        if (descendants) {
            serviceList.forEach((options, servicePath) => {
                if (servicePath.startsWith(path))
                    serviceFile.push({ name: options.name.value, path: servicePath });
            });
        } else {
            if (serviceList.has(path))
                serviceFile.push({ name: serviceList.get(path).name.value, path });
        }

        if (serviceFile.length > 0) {
            showMessageBox({
                icon: 'warning',
                title: `检测到以下文件属于服务运行文件，无法${action === 'delete' ? '删除' : '剪切'}`,
                content: serviceFile.map(({ name, path }) => `服务名：${name} 文件路径：${path}`).join('\n')
            });
            resolve(false);
        } else
            resolve(true);
    });
}