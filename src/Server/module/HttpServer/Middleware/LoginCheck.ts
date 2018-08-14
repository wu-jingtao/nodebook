import * as koa from 'koa';

import { UserManager } from '../../UserManager/UserManager';

/**
 * 检查用户是否登录
 */
export function LoginCheck(userManager: UserManager): koa.Middleware {
    return function LoginCheck(ctx, next) {
        userManager.checkLogin(ctx.cookies.get('nodebook_token'));
        return next();
    }
}