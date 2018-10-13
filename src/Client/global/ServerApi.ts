import md5 = require('blueimp-md5');
import { ObservableVariable } from 'observable-variable';

import { Get, Post } from './Tools/Ajax';

/**
 * 服务器端接口
 */
export const ServerApi = {
    /**
     * 用户相关操作
     */
    user: {
        /**
         * 登陆
         */
        async login(username: string, password: string): Promise<void> {
            expect(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(username), true, '传入的电子邮箱格式不正确');
            expect(await Post('/user/login', { name: username, pass: md5(password) }), 'ok', '登陆失败');
        },
        /**
         * 更新用户令牌
         */
        async updateToken(): Promise<void> {
            expect(await Get('/user/update_token'), 'ok', '更新用户令牌失败，请重新登陆');
        },
    },
    /**
     * 系统设置
     */
    settings: {
        /**
         * 获取所有普通设置项
         */
        async getAllNormalKey(): Promise<ReadonlyArray<{ key: string, value: any }>> {
            return JSON.parse(await Get('/setting/getAllNormalKey'));
        },
        /**
         * 获取所有私密设置。除了密码
         */
        async getAllSecretKey(): Promise<ReadonlyArray<{ key: string, value: any }>> {
            return JSON.parse(await Get('/setting/getAllSecretKey'));
        },
        /**
         * 更改普通设置项
         */
        async changeNormalSetting(key: string, value: any): Promise<void> {
            expect(await Post('/setting/changeNormalSetting', { key, value }), 'ok', '更改普通设置项失败');
        },
        /**
         * 更改私密设置项
         */
        async changeSecretSetting(key: string, value: any, password: string): Promise<void> {
            expect(await Post('/setting/changeSecretSetting', { key, value, password: md5(password) }), 'ok', '更改私密设置项失败');
        },
    },
    /**
     * 文件操作
     */
    file: {
        /**
         * 读取服务器端文件数据
         * @param path 传入的路径需对应服务器端全路径
         */
        async readFile(path: string): Promise<any> {
            return await Get('/file/api/readFile', { path }, true);
        },
        /**
         * 列出某个目录中的子目录与文件
         * @param path 
         */
        async listDirectory(path: string): Promise<ReadonlyArray<{ name: string, isFile: boolean, isBinary: boolean, modifyTime: number, size: number }>> {
            return JSON.parse(await Post('/file/api/listDirectory', { path }));
        },
        /**
         * 创建目录
         * @param path
         */
        async createDirectory(path: string): Promise<void> {
            expect(await Post('/file/api/createDirectory', { path }), 'ok', '创建目录失败');
        },
        /**
         * 复制文件或整个目录
         * @param from
         * @param to
         */
        async copy(from: string, to: string): Promise<void> {
            expect(await Post('/file/api/copy', { from, to }), 'ok', '复制文件失败');
        },
        /**
         * 移动文件或整个目录
         * @param from
         * @param to
         */
        async move(from: string, to: string): Promise<void> {
            expect(await Post('/file/api/move', { from, to }), 'ok', '移动文件失败');
        },
        /**
         * 上传文件。新建文件、修改文件也是用这个
         * @param file
         * @param to
         */
        uploadFile(file: Blob, to: string, progress?: ObservableVariable<number>) {
            const promise = Post('/file/api/uploadFile', { to }, file, progress);
            const result: typeof promise = promise.then(e => expect(e, 'ok', '上传文件失败')) as any;
            result.abort = promise.abort;
            return result;
        },
        /**
         * 删除 '_userCodeDir' 下的文件或目录
         * @param path
         */
        async deleteCodeData(path: string): Promise<void> {
            expect(await Post('/file/api/deleteCodeData', { path }), 'ok', '删除失败');
        },
        /**
         * 删除 '_programDataDir' 下的文件或目录
         * @param path
         */
        async deleteProgramData(path: string): Promise<void> {
            expect(await Post('/file/api/deleteProgramData', { path }), 'ok', '删除失败');
        },
        /**
         * 删除 '_recycleDir' 下的文件或目录
         * @param path
         */
        async deleteRecycleData(path: string): Promise<void> {
            expect(await Post('/file/api/deleteRecycleData', { path }), 'ok', '删除失败');
        },
        /**
         * 清空回收站
         */
        async cleanRecycle(): Promise<void> {
            expect(await Post('/file/api/cleanRecycle'), 'ok', '清空回收站失败');
        },
        /**
         * 压缩某个文件或目录
         * @param path
         * @param to
         */
        async zipData(path: string, to: string): Promise<void> {
            if (!to.endsWith('.zip'))
                throw new Error("压缩文件的后缀名必须以'zip'结尾");

            expect(await Post('/file/api/zipData', { path, to }), 'ok', '压缩失败');
        },
        /**
         * 解压压缩文件
         * @param path
         * @param to
         */
        async unzipData(path: string, to: string): Promise<void> {
            if (!path.endsWith('.zip'))
                throw new Error("压缩文件的后缀名必须以'zip'结尾");

            expect(await Post('/file/api/unzipData', { path, to }), 'ok', '解压失败');
        },
    }
};

//断言
function expect(expect: any, tobe: any, exceptionMessage: string) {
    if (expect !== tobe) throw new Error(exceptionMessage);
}