import md5 = require('blueimp-md5');
import { ObservableVariable } from 'observable-variable';

import { Get, Post } from './Tools/Ajax';
import { expect } from './Tools/Tools';

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
            return await Get('/setting/getAllNormalKey');
        },
        /**
         * 获取所有私密设置。除了密码
         */
        async getAllSecretKey(): Promise<ReadonlyArray<{ key: string, value: any }>> {
            return await Get('/setting/getAllSecretKey');
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
         * 列出某个目录中的子目录与文件
         * @param path 传入的路径需对应服务器端全路径
         */
        async listDirectory(path: string): Promise<ReadonlyArray<{ name: string, isFile: boolean, modifyTime: number, size: number }>> {
            return await Post('/file/api/listDirectory', { path });
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
        async uploadFile(file: Blob, to: string, progress?: ObservableVariable<number>): Promise<void> {
            expect(await Post('/file/api/uploadFile', { to }, file, progress), 'ok', '上传文件失败');
        },
    }
};
