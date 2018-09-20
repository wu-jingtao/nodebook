import * as localforage from 'localforage';
import { oSet } from 'observable-variable';

import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { ServerApi } from '../../../../../../global/ServerApi';

const db = localforage.createInstance({
    name: 'UnsavedFiles',
    description: '缓存未保存到服务器端的文件'
});

function errorHandler<T>(promise: Promise<T>, errorTip: string, fullNameString?: string): Promise<T | void> {
    return promise.catch(err => {
        showMessageBox({
            icon: 'error',
            title: errorTip,
            content: fullNameString ? `文件：${fullNameString}。${err.message}` : err.message
        });
    });
}

/**
 * 缓存的文件名称列表
 */
export const cachedFiles = oSet<string>([], { readonly: true });
errorHandler(db.keys(), '读取缓存文件列表失败').then(value => {
    if (value) {
        cachedFiles.readonly = false;
        cachedFiles.value = new Set(value);
        cachedFiles.readonly = true;
    }
});

/**
 * 缓存某个文件的改变
 * @param fullNameString 文件的完整路径名称
 * @param data 要缓存的数据
 */
export function cache(fullNameString: string, data: string): Promise<string | void> {
    return errorHandler(db.setItem(fullNameString, data), '缓存文件改变失败', fullNameString).then(v => {
        cachedFiles.readonly = false;
        cachedFiles.add(fullNameString);
        cachedFiles.readonly = true;
        return v;
    });
}

/**
 * 读取某个缓存文件
 * @param fullNameString 文件的完整路径名称
 */
export function readCache(fullNameString: string): Promise<string | void> {
    return errorHandler(db.getItem(fullNameString), '读取缓存文件失败', fullNameString);
}

/**
 * 删除某个文件的缓存
 * @param fullNameString 文件的完整路径名称
 */
export function removeCache(fullNameString: string): Promise<void> {
    return errorHandler(db.removeItem(fullNameString), '删除缓存文件失败', fullNameString).then(() => {
        cachedFiles.readonly = false;
        cachedFiles.delete(fullNameString);
        cachedFiles.readonly = true;
    });
}

/**
 * 清空缓存文件
 */
export function clearCache(): Promise<void> {
    return errorHandler(db.clear(), '清空缓存文件失败');
}

/**
 * 将缓存的文件保存到服务器端，上传成功后将删除本地缓存
 * @param fullNameString 文件的完整路径名称
 */
export function saveToServer(fullNameString: string): Promise<void> {
    return errorHandler(db.getItem<string | null>(fullNameString).then(async (value) => {
        if (value !== null) {
            const data = new Blob([value], { type: 'text/plain' });
            await ServerApi.file.uploadFile(data, fullNameString);
            
            await db.removeItem(fullNameString);

            cachedFiles.readonly = false;
            cachedFiles.delete(fullNameString);
            cachedFiles.readonly = true;
        }
    }), '将缓存的文件保存到服务器端失败', fullNameString);
}