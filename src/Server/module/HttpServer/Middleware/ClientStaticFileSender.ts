import * as path from 'path';
import * as fs from 'fs';
import * as koa from 'koa';
import * as koa_compose from 'koa-compose';
import * as Error from 'http-errors';
import koa_conditional = require('koa-conditional-get');
import koa_etag = require('koa-etag');

import { FileManager } from '../../FileManager/FileManager';

/**
 * 客户端程序静态文件发送工具。
 */
export function ClientStaticFileSender(): koa.Middleware {
    return koa_compose([
        koa_conditional(),
        koa_etag(),
        async function StaticFileSender(ctx) {
            try {
                ctx.body = fs.createReadStream(path.join(FileManager._appClientFileDir, ctx.params.path));
            } catch {
                throw new Error.NotFound();
            }
        }
    ]);
}