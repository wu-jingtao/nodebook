import * as path from 'path';
import * as koa from 'koa';
import * as koa_compose from 'koa-compose';
import * as koa_router from 'koa-router';

import { HttpServer } from '../HttpServer';
import { UserManager } from '../../UserManager/UserManager';

import { FormParser } from './FormParser';
import { LoginCheck } from './LoginCheck';
import { Favicon } from './Favicon';
import { ClientStaticFileSender } from './ClientStaticFileSender';
import { FileManager } from '../../FileManager/FileManager';

/**
 * 路由控制
 */
export function Router(httpServer: HttpServer): koa.Middleware {

    const router_login = new koa_router();      //挂在该路由上的会进行身份验证
    const router_no_login = new koa_router();

    router_login.use(LoginCheck(httpServer.services.UserManager));

    router_no_login.get('favicon', '/favicon.ico', Favicon(httpServer.services.SystemSetting));
    router_no_login.get('static', '/static/:path(.+?\\..+)', ClientStaticFileSender());
    router_no_login.redirect('/', '/static/index.html');

    User(router_login, router_no_login, httpServer);
    File(router_login, httpServer);

    return koa_compose([
        FormParser(httpServer.services.SystemSetting),
        router_login.routes(),
        router_no_login.routes(),
        router_login.allowedMethods(),
        router_no_login.allowedMethods()
    ]);
}

/**
 * 配置用户相关操作
 */
function User(router_login: koa_router, router_no_login: koa_router, httpServer: HttpServer) {

    const _userManager: UserManager = httpServer.services.UserManager;
    const _prefix = '/user';

    /**
     * 用户登录。
     * @param name 用户名
     * @param pass 登录密码，注意客户端在传递密码之前需要进行MD5操作
     * @returns 'ok'
     */
    router_no_login.post(_prefix + '/login', ctx => {
        const token = _userManager.login(ctx.request.body.name, ctx.request.body.pass, ctx.ip);
        ctx.cookies.set('nodebook_token', token);
        ctx.body = 'ok';
    });

    /**
     * 用户更新自己的令牌
     * @returns 'ok'
     */
    router_login.get(_prefix + '/update_token', ctx => {
        const token = _userManager.updateToken();
        ctx.cookies.set('nodebook_token', token);
        ctx.body = 'ok';
    });

    /**
     * 更改用户密码
     * @param new_pass 新密码
     * @param old_pass 旧密码
     * @returns 'ok'
     */
    router_login.post(_prefix + '/updatePassword', ctx => {
        _userManager.updatePassword(ctx.request.body.new_pass, ctx.request.body.old_pass);
        ctx.body = 'ok';
    });
}

/**
 * 配置文件相关操作
 */
function File(router: koa_router, httpServer: HttpServer) {
    const _fileManager: FileManager = httpServer.services.FileManager;

    const _prefix_api = '/file/api';    //文件操作方法
    const _prefix_data = '/file/data';  //读取文件内容

    /**
     * 列出某个目录中的子目录与文件
     * @param path
     */
    router.post(_prefix_api + '/list', async (ctx) => {
        ctx.body = await _fileManager.listDirectory(path.join(FileManager._userDataDir, ctx.request.body.path));
    });
}