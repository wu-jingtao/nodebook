import * as localforage from 'localforage';
import { ObservableVariable, oVar, oSet, oMap } from 'observable-variable';

import { showMessageBox } from '../../../MessageBox/MessageBox';
import { ServerApi } from '../../../../global/ServerApi';

/**
 * 未保存文件数据库
 */
const db = localforage.createInstance({ name: 'UnsavedFiles' });

//#region 未保存文件列表

/**
 * 未保存文件列表。要删除某个未保存文件可直接删除其对应的路径
 */
export const unsavedFiles = oSet<string>([]);

db.keys()
    .then(value => {
        unsavedFiles.value = new Set(value);

        //将所有未保存文件的数据读取到内存
        setTimeout(() => unsavedFiles.forEach(path => getEditorData(path)), 1);
    })
    .catch(err => console.log('读取未保存文件列表失败', err));

unsavedFiles.on('remove', async (path) => {
    try {
        await db.removeItem(path);

        //将编辑器内容更换为修改前的样子
        loadData(path);
    } catch (err) {
        showMessageBox({ icon: 'error', title: '删除未保存文件失败', content: `文件：${path}。${err.message}` });
    }
});

/**
 * 将未保存的文件保存到服务器端，上传成功后将删除本地缓存
 */
export async function saveToServer(path: string): Promise<void> {
    if (unsavedFiles.has(path)) {
        const ed = editorData.get(path);
        if (ed) {
            try {
                ed.processing.value = true;

                const data = new Blob([ed.data.value.data], { type: 'text/plain' });
                await ServerApi.file.uploadFile(data, path);
                unsavedFiles.delete(path);
            } catch (err) {
                showMessageBox({ icon: 'error', title: '将文件修改保存到服务器端失败', content: `文件：${path}。${err.message}` });
            } finally {
                ed.processing.value = false;
            }
        }
    }
}

/**
 * 保存全部到服务器端
 */
export async function saveAllToServer(): Promise<void> {
    await Promise.all([...unsavedFiles.values()].map(path => saveToServer(path)));
}

//#endregion

//#region 编辑器数据

/**
 * 代码编辑器中正在编辑的数据。当某个文件删除时需要删除对应的editorData
 * @property processing 表示当前数据正在处理哪些操作
 * @property changer 表示哪个对象更改了数据
 * @property type 'change' 表示该次改变是由用户输入造成的，'update' 表示改变是由程序造成的
 */
export const editorData = oMap<string, { processing: ObservableVariable<boolean>, data: ObservableVariable<{ changer: any, type: 'change' | 'update', data: string }> }>([]);

editorData.on('remove', (_, path) => {
    sessionStorage.removeItem(`fileCache-${path}`);
    unsavedFiles.delete(path);
});

editorData.on('add', async (item, path) => {
    await loadData(path);

    item.data.on('set', async (data) => {
        if (data.type === 'change') {
            try {
                await db.setItem(path, data.data);
                unsavedFiles.add(path);
            } catch (err) {
                showMessageBox({ icon: 'error', title: '缓存未保存文件失败', content: `文件：${path}。${err.message}` });
            }
        }
    });
});

/**
 * 加载数据
 * @param refresh 是否需要重新从服务器端加载
 */
async function loadData(path: string, refresh?: boolean): Promise<void> {
    const ed = editorData.get(path);

    if (ed) {
        try {
            ed.processing.value = true;

            if (unsavedFiles.has(path)) {
                if (refresh) {
                    showMessageBox({
                        icon: 'question',
                        title: '刷新数据将导致当前对文件的修改被擦除，是否继续?',
                        buttons: {
                            ok: {
                                callback: () => {
                                    sessionStorage.removeItem(`fileCache-${path}`);
                                    unsavedFiles.delete(path);
                                }
                            },
                            cancel: { callback() { } }
                        }
                    });
                } else
                    ed.data.value = { changer: undefined, type: 'update', data: await db.getItem(path) as any };
            } else {
                let data = sessionStorage.getItem(`fileCache-${path}`);

                if (data === null || refresh) {
                    data = await ServerApi.file.readFile(path);
                    sessionStorage.setItem(`fileCache-${path}`, data as any);
                }

                ed.data.value = { changer: undefined, type: 'update', data: data as any };
            }
        } catch (err) {
            showMessageBox({ icon: 'error', title: '加载数据失败', content: `文件：${path}。${err.message}` });
        } finally {
            ed.processing.value = false;
        }
    }
}

/**
 * 获取编辑器数据
 * @param path 文件的完整路径
 */
export function getEditorData(path: string) {
    if (editorData.has(path))
        return editorData.get(path);
    else {
        const data = { processing: oVar(false), data: oVar({ changer: undefined, type: 'update' as any, data: '' }) };
        editorData.set(path, data);
        return data;
    }
}

//#endregion