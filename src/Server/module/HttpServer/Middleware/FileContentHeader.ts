import * as fs from 'fs';
import * as path from 'path';
import * as koa from 'koa';
import * as mime from 'mime-types';
import * as isStream from 'is-stream';

/**
 * 设置文件的响应头 Content-Type、Content-Length
 */
export function FileContentHeader(): koa.Middleware {
    return async function FileContentHeader(ctx, next) {
        await next();

        if (isStream(ctx.body) && 'path' in ctx.body) {
            const filePath = (ctx.body as fs.ReadStream).path as string;
            ctx.type = mime.contentType(path.extname(filePath)) || 'application/octet-stream';

            if (/.(wav|mpeg|mp3|mp4|webm|aac|aacp|ogg|flac|rm|rmvb|3gp|avi|mpg|mov|mkv)$/i.test(filePath)) {
                const stat = await fs.promises.stat(filePath);
                ctx.set('Accept-Ranges', 'bytes');

                if (ctx.header.range) { //分段下载媒体文件
                    let [range_start, range_end] = (ctx.header.range as string).slice(6).split('-');

                    //指定 ReadStream 的开始位置和结束位置
                    const start = Math.max(0, Math.min(stat.size - 1, Number.parseInt(range_start) || 0));
                    const end = range_end ? Math.max(start, Math.min(stat.size - 1, Number.parseInt(range_end) || 0)) : stat.size - 1;

                    ctx.body = fs.createReadStream(filePath, { start, end });

                    ctx.set('Content-Length', (end - start + 1).toString());
                    ctx.set('Content-Range', `bytes ${start}-${end}/${stat.size}`);
                    ctx.status = 206;
                } else {
                    ctx.set('Content-Length', stat.size.toString());
                    ctx.set('Content-Range', `bytes ${0}-${stat.size - 1}/${stat.size}`);
                }
            }
        }
    }
}