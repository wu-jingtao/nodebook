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
            expect(await Post('/user/login', { user: username, pass: md5(password) }), 'ok', '登陆失败');
        },

        /**
         * 更新用户令牌
         */
        async updateToken(): Promise<void> {
            expect(await Get('/user/update_token'), 'ok', '更新用户令牌失败，请重新登陆');
        },
    }
};
