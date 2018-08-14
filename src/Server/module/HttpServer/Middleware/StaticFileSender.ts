import * as path from 'path';
import * as fs from 'fs';
import * as koa from 'koa';
import * as koa_compose from 'koa-compose';
import koa_conditional = require('koa-conditional-get');
import koa_etag = require('koa-etag');

/**
 * 静态文件发送工具。注意，路由参数里面必须要有一个path属性
 * @param rootPath 根目录
 */
export function StaticFileSender(rootPath: string): koa.Middleware {
    fs.accessSync(rootPath);    //确保传入的文件夹可以访问

    return koa_compose([
        koa_conditional(),
        koa_etag(),
        function StaticFileSender(ctx) {
            ctx.body = fs.createReadStream(path.join(rootPath, ctx.params.path));
        }
    ]);
}