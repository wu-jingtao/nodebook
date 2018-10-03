import * as localforage from 'localforage';
import { oSet } from 'observable-variable';

import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { ServerApi } from '../../../../../../global/ServerApi';

const db = localforage.createInstance({
    name: 'UnsavedFiles',
    description: '缓存未保存到服务器端的文件'
});

/**
 * 缓存的文件名称列表。
 */
export const cachedFiles = oSet<string>([]);
db.keys().then(value => cachedFiles.value = new Set(value)).catch(err => {
    showMessageBox({
        icon: 'error',
        title: '读取缓存文件列表失败',
        content: err.message
    });
});

/**
 * 缓存某个文件的改变
 * @param fullNameString 文件的完整路径名称
 * @param data 要缓存的数据
 */
export function cache(fullNameString: string, data: string): Promise<void> {
    return db.setItem(fullNameString, data).then(() => { cachedFiles.add(fullNameString) }).catch(err => {
        showMessageBox({
            icon: 'error',
            title: '缓存文件失败',
            content: `文件：${fullNameString}。${err.message}`
        });
    });
}

/**
 * 读取某个缓存文件
 * @param fullNameString 文件的完整路径名称
 */
export function readCache(fullNameString: string): Promise<string | null> {
    return db.getItem<string>(fullNameString).catch(err => {
        showMessageBox({
            icon: 'error',
            title: '读取缓存文件失败',
            content: `文件：${fullNameString}。${err.message}`
        });

        return null;
    });
}

/**
 * 删除某个文件的缓存
 * @param fullNameString 文件的完整路径名称
 */
export function removeCache(fullNameString: string): Promise<void> {
    return db.removeItem(fullNameString).then(() => { cachedFiles.delete(fullNameString) }).catch(err => {
        showMessageBox({
            icon: 'error',
            title: '删除缓存文件失败',
            content: `文件：${fullNameString}。${err.message}`
        });
    });
}

/**
 * 清空缓存文件
 */
export function clearCache(): Promise<void> {
    return db.clear().then(() => { cachedFiles.clear() }).catch(err => {
        showMessageBox({
            icon: 'error',
            title: '清空缓存文件失败',
            content: err.message
        });
    });
}

/**
 * 将缓存的文件保存到服务器端，上传成功后将删除本地缓存
 * @param fullNameString 文件的完整路径名称
 */
export async function saveToServer(fullNameString: string): Promise<void> {
    try {
        const value = await db.getItem<string | null>(fullNameString);
        if (value !== null) {
            const data = new Blob([value], { type: 'text/plain' });
            await ServerApi.file.uploadFile(data, fullNameString);
            await removeCache(fullNameString);
        }
    } catch (err) {
        showMessageBox({
            icon: 'error',
            title: '将缓存的文件保存到服务器端失败',
            content: `文件：${fullNameString}。${err.message}`
        });
    }
}

/**
 * 保存全部到服务器端
 */
export async function saveAllToServer(): Promise<void> {
    await Promise.all([...cachedFiles.values()].map(path => saveToServer(path)));
}