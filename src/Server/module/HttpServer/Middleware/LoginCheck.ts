import * as koa from 'koa';

import { UserManager } from '../../UserManager/UserManager';
import { HttpServer } from '../HttpServer';

/**
 * 检查用户是否登录
 */
export function LoginCheck(httpServer: HttpServer): koa.Middleware {
    const userManager = httpServer.services.UserManager as UserManager;

    return function LoginCheck(ctx, next) {
        userManager.checkLogin(ctx.cookies.get('nodebook_token') as string);
        return next();
    }
}