import * as node_path from 'path';
import * as _ from 'lodash';
import * as koa from 'koa';
import * as koa_compose from 'koa-compose';
import * as koa_router from 'koa-router';

import { HttpServer } from '../HttpServer';
import { UserManager } from '../../UserManager/UserManager';
import { FileManager } from '../../FileManager/FileManager';

import { FormParser } from './FormParser';
import { LoginCheck } from './LoginCheck';
import { Favicon } from './Favicon';
import { ClientStaticFileSender } from './ClientStaticFileSender';

/**
 * 路由控制
 */
export function Router(httpServer: HttpServer): koa.Middleware {

    const router_login = new koa_router();      //挂在该路由上的会进行身份验证
    const router_no_login = new koa_router();

    router_login.use(LoginCheck(httpServer.services.UserManager));

    router_no_login.get('favicon', '/favicon.ico', Favicon());
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
     */
    router_no_login.post(_prefix + '/login', ctx => {
        const token = _userManager.login(ctx.request.body.name, ctx.request.body.pass, ctx.ip);
        ctx.cookies.set('nodebook_token', token);
        ctx.body = 'ok';
    });

    /**
     * 用户更新自己的令牌
     */
    router_login.post(_prefix + '/update_token', ctx => {
        const token = _userManager.updateToken();
        ctx.cookies.set('nodebook_token', token);
        ctx.body = 'ok';
    });

    /**
     * 更改用户名
     * @param username 新用户名
     * @param password 密码
     */
    router_login.post(_prefix + '/updatePassword', ctx => {
        _userManager.updateUsername(ctx.request.body.username, ctx.request.body.password);
        ctx.body = 'ok';
    });

    /**
     * 更改用户密码
     * @param new_pass 新密码
     * @param old_pass 旧密码
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

    //#region 读取文件操作

    /**
     * 读取用户代码目录下的文件
     * @param path 相对于用户代码目录
     */
    router.get(_prefix_data + '/code/:path(.+?\\..+)', async (ctx) => {
        ctx.body = await _fileManager.readFile(node_path.join(FileManager._userCodeDir, ctx.params.path));
    });

    /**
     * 读取用户程序数据目录下的文件
     * @param path
     */
    router.get(_prefix_data + '/programData/:path(.+?\\..+)', async (ctx) => {
        ctx.body = await _fileManager.readFile(node_path.join(FileManager._programDataDir, ctx.params.path));
    });

    /**
     * 读取用户回收站目录下的文件
     * @param path 
     */
    router.get(_prefix_data + '/recycle/:path(.+?\\..+)', async (ctx) => {
        ctx.body = await _fileManager.readFile(node_path.join(FileManager._recycleDir, ctx.params.path));
    });

    /**
     * 读取用户类库目录下的文件
     * @param path
     */
    router.get(_prefix_data + '/library/:path(.+?\\..+)', async (ctx) => {
        ctx.body = await _fileManager.readFile(node_path.join(FileManager._libraryDir, ctx.params.path));
    });

    /**
     * 这个相当于上面那4个的汇总，上面的主要是方便用户使用，这个主要是方便程序内部使用
     * @param path 传入的路径需对应服务器端全路径
     */
    router.post(_prefix_api + '/readFile', async (ctx) => {
        ctx.body = await _fileManager.readFile(ctx.request.body.path);
    });

    //#endregion

    /**
     * 列出某个目录中的子目录与文件
     * @param path 传入的路径需对应服务器端全路径
     */
    router.post(_prefix_api + '/listDirectory', async (ctx) => {
        ctx.body = await _fileManager.listDirectory(ctx.request.body.path);
    });

    /**
     * 创建目录
     * @param path
     */
    router.post(_prefix_api + '/createDirectory', async (ctx) => {
        await _fileManager.createDirectory(ctx.request.body.path);
        ctx.body = 'ok';
    });

    /**
     * 复制文件或整个目录
     * @param from
     * @param to
     */
    router.post(_prefix_api + '/copy', async (ctx) => {
        await _fileManager.copy(ctx.request.body.from, ctx.request.body.to);
        ctx.body = 'ok';
    });

    /**
     * 移动文件或整个目录
     * @param from
     * @param to
     */
    router.post(_prefix_api + '/move', async (ctx) => {
        await _fileManager.move(ctx.request.body.from, ctx.request.body.to);
        ctx.body = 'ok';
    });

    /**
     * 上传文件，一次只允许上传一个文件
     * @param to 
     */
    router.post(_prefix_api + '/uploadFile', async (ctx) => {
        if (_.get(ctx.request.body, 'files.length') !== 1)
            throw new Error('上传的文件数目不符合要求，每次必须且只能是一个文件');

        await _fileManager.moveFromOutside(ctx.request.body.files[0].path, ctx.request.body.to);
        ctx.body = 'ok';
    });

    /**
     * 删除 '_userCodeDir' 下的文件或目录
     * @param path
     */
    router.post(_prefix_api + '/deleteCodeData', async (ctx) => {
        await _fileManager.deleteCodeData(ctx.request.body.path);
        ctx.body = 'ok';
    });

    /**
     * 永久删除 '_userCodeDir' 下的文件或目录
     * @param path
     */
    router.post(_prefix_api + '/deleteCodeDataDirectly', async (ctx) => {
        await _fileManager.deleteCodeDataDirectly(ctx.request.body.path);
        ctx.body = 'ok';
    });

    /**
     * 清空回收站
     */
    router.post(_prefix_api + '/cleanRecycle', async (ctx) => {
        await _fileManager.cleanRecycle();
        ctx.body = 'ok';
    });

    /**
     * 永久删除 '_programDataDir' 下的文件或目录
     * @param path
     */
    router.post(_prefix_api + '/deleteProgramData', async (ctx) => {
        await _fileManager.deleteProgramData(ctx.request.body.path);
        ctx.body = 'ok';
    });

    /**
     * 压缩某个文件或目录
     * @param path
     * @param to
     */
    router.post(_prefix_api + '/zipData', async (ctx: any) => {
        await _fileManager.zipData(ctx.request.body.path, ctx.request.body.to);
        ctx.body = 'ok';
    });

    /**
     * 解压压缩文件
     * @param path
     * @param to
     */
    router.post(_prefix_api + '/unzipData', async (ctx: any) => {
        await _fileManager.unzipData(ctx.request.body.path, ctx.request.body.to);
        ctx.body = 'ok';
    });

    /**
     * 压缩某个文件或目录，用于用户下载
     * @param path
     */
    router.post(_prefix_api + '/zipDownloadData', async (ctx: any) => {
        ctx.compress = false;   //确保不会被 koa-compress 压缩
        ctx.body = await _fileManager.zipDownloadData(ctx.request.body.path);
    });

    /**
     * 解压用户上传的zip文件到指定目录
     * @param to 
     */
    router.post(_prefix_api + '/unzipUploadData', async (ctx) => {
        if (_.get(ctx.request.body, 'files.length') !== 1)
            throw new Error('上传的文件数目不符合要求，每次必须且只能是一个文件');

        await _fileManager.unzipUploadData(ctx.request.body.files[0].path, ctx.request.body.to);
        ctx.body = 'ok';
    });
}