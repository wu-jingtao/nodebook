import md5 = require('blueimp-md5');

import { Get, Post } from './Tools/Ajax';
import { expect } from './Tools/Assert';

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
    }
};
