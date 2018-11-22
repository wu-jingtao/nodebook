import * as React from 'react';
import * as localforage from 'localforage';
import * as monaco from 'monaco-editor';
import { ObservableVariable, oVar, oSet } from 'observable-variable';
import debounce = require('lodash.debounce');

import { ServerApi } from '../../../../../../global/ServerApi';
import { FileIcon } from '../../../../../../global/Component/FileIcon/FileIcon';
import { checkIsBusy, processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { showPopupWindow } from '../../../../../PopupWindow/PopupWindow';

const less_deleteFiles = require('../../../../../../global/Component/Tree/EditableFileTree/DeleteFiles/DeleteFiles.less');
const less_userCodePanel = require('../../../FunctionArea/FunctionPanel/FileManager/component/UserCodePanel/UserCodePanel.less');

//文件缓存数据库
const originalFilesCache = localforage.createInstance({ name: 'originalFilesCache' });
const unsavedFilesCache = localforage.createInstance({ name: 'unsavedFilesCache' });

//在内存中的缓存文件列表
const cacheList = new Map<string, { original: monaco.editor.ITextModel, modified: monaco.editor.ITextModel, refNumber: ObservableVariable<number> }>();

/**
 * 未保存的文件名称列表。
 */
export const unsavedFiles = oSet<string>([]);

unsavedFilesCache.keys()
    .then(value => { unsavedFiles.value = new Set(value); })
    .catch(err => console.log('读取未保存文件列表失败', err));

/**
 * 获取指定文件的缓存数据
 * @param path 文件的完整路径
 */
export async function getCache(path: string) {
    if (checkIsBusy(path)) {
        try {
            processingItems.add(path);

            let cache = cacheList.get(path);

            if (cache === undefined) {
                const refNumber = oVar(0);  //引用数
                let modified: monaco.editor.ITextModel;
                let original: monaco.editor.ITextModel;

                if (unsavedFiles.has(path)) {
                    modified = monaco.editor.createModel(await unsavedFilesCache.getItem(path) as string, undefined, monaco.Uri.parse(`modified:/${path}`));
                    original = monaco.editor.createModel(await originalFilesCache.getItem(path) as string, undefined, monaco.Uri.parse(`original:/${path}`));
                } else {
                    let data = sessionStorage.getItem(`fileCache-${path}`);

                    if (data === null) {
                        data = await ServerApi.file.readFile(path);
                        sessionStorage.setItem(`fileCache-${path}`, data as any);
                    }

                    modified = monaco.editor.createModel(data as string, undefined, monaco.Uri.parse(`modified:/${path}`));
                    original = monaco.editor.createModel(data as string, undefined, monaco.Uri.parse(`original:/${path}`));
                }

                modified.onDidChangeContent(debounce(async () => {
                    const md = modified.getValue(), or = original.getValue();
                    if (md !== or) {
                        try {
                            await originalFilesCache.setItem(path, or);
                            await unsavedFilesCache.setItem(path, md);
                            unsavedFiles.add(path);
                        } catch (err) {
                            showMessageBox({ icon: 'error', title: '缓存文件失败', content: `文件：${path}。${err.message}` });
                        }
                    } else {
                        try {
                            await originalFilesCache.removeItem(path);
                            await unsavedFilesCache.removeItem(path);
                            unsavedFiles.delete(path);
                        } catch (err) {
                            showMessageBox({ icon: 'error', title: '删除文件缓存失败', content: `文件：${path}。${err.message}` });
                        }
                    }
                }, 1000));

                let disposeTimer: any;
                refNumber.on('set', value => {
                    if (value === 0) {  //当没有编辑器引用时清除资源
                        disposeTimer = setTimeout(() => {
                            modified.dispose();
                            original.dispose();
                            cacheList.delete(path);
                        }, 1000 * 60);
                    } else
                        clearTimeout(disposeTimer);
                });

                cacheList.set(path, { modified, original, refNumber });
                cache = { modified, original, refNumber };
            }

            cache.refNumber.value++;
            return {
                modified: cache.modified,
                original: cache.original,
                dispose() {
                    (cache as any).refNumber.value--;
                }
            };
        } catch (err) {
            showMessageBox({ icon: 'error', title: '加载数据失败', content: `文件：${path}。${err.message}` });
        } finally {
            processingItems.delete(path);
        }
    }
}

/**
 * 擦除文件更改
 * @param descendants 是否包含后代，这个主要是针对于文件夹
 */
export async function discardChange(path: string, descendants?: boolean) {
    for (const item of unsavedFiles.value) {
        if (descendants ? item.startsWith(path) : item === path) {
            const cache = cacheList.get(item);

            if (cache)
                cache.modified.setValue(cache.original.getValue());
            else {
                try {
                    await originalFilesCache.removeItem(item);
                    await unsavedFilesCache.removeItem(item);
                    unsavedFiles.delete(item);
                } catch (err) {
                    showMessageBox({ icon: 'error', title: '删除文件缓存失败', content: `文件：${item}。${err.message}` });
                }
            }

            if (!descendants) break;
        }
    }
}

/**
 * 重新从服务器端读取数据
 */
export function refreshData(path: string) {
    const cache = cacheList.get(path);

    if (cache) {
        async function loadData() {
            if (checkIsBusy(path)) {
                try {
                    processingItems.add(path);

                    const data = await ServerApi.file.readFile(path);
                    sessionStorage.setItem(`fileCache-${path}`, data as any);

                    (cache as any).original.setValue(data);
                    (cache as any).modified.setValue(data);
                } catch (err) {
                    showMessageBox({ icon: 'error', title: '刷新失败', content: `文件：${path}。${err.message}` });
                } finally {
                    processingItems.delete(path);
                }
            }
        }

        if (unsavedFiles.has(path)) {
            showPopupWindow({
                title: '有未保存的文件',
                content: (
                    <>
                        <div className={less_userCodePanel.DeleteUnsavedFiles}>文件并未保存，刷新将会使得更改的内容被删除，是否继续?</div>
                        <div className={less_deleteFiles.DeleteFiles}>
                            <FileIcon className={less_deleteFiles.icon} filename={path.split('/').pop() as string} />
                            <input className={less_deleteFiles.filename} readOnly value={path} />
                        </div>
                    </>
                ),
                ok: { callback: loadData }
            });
        } else
            loadData();
    }
}

/**
 * 将更改保存到服务器
 */
export async function saveToServer(path: string) {
    if (unsavedFiles.has(path) && checkIsBusy(path)) {
        try {
            processingItems.add(path);

            const cache = cacheList.get(path);
            const data = cache ? cache.modified.getValue() : await unsavedFilesCache.getItem(path) as string;
            const file = new Blob([data], { type: 'text/plain' });
            await ServerApi.file.uploadFile(file, path);

            await originalFilesCache.removeItem(path);
            await unsavedFilesCache.removeItem(path);
            unsavedFiles.delete(path);
            sessionStorage.setItem(`fileCache-${path}`, data);
            if (cache) cache.original.setValue(data);
        } catch (err) {
            showMessageBox({ icon: 'error', title: '将修改保存到服务器端失败', content: `文件：${path}。${err.message}` });
        } finally {
            processingItems.delete(path);
        }
    }
}