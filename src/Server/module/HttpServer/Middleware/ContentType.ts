import * as fs from 'fs';
import * as path from 'path';
import * as koa from 'koa';
import * as mime from 'mime-types';
import * as isStream from 'is-stream';

/**
 * 设置 response header 的 ContentType
 */
export function ContentType(): koa.Middleware {
    return async function ContentType(ctx, next) {
        await next();

        if (isStream(ctx.body) && 'path' in ctx.body)
            ctx.type = mime.contentType(path.extname((ctx.body as fs.ReadStream).path.toString())) || 'application/octet-stream';
    }
}