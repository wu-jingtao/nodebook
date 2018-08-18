import * as koa from 'koa';
import * as moment from 'moment';

import { HttpServer } from '../HttpServer';
import { MainProcessCommunicator } from '../../MainProcess/MainProcessCommunicator';

/**
 * 错误处理方法
 */
export function ErrorHandling(httpServer: HttpServer): koa.Middleware {
    //是否开启了debug模式。如果开启了,则会将错误的堆栈信息也输出给用户
    const _mainProcessCommunicator = httpServer.services.MainProcessCommunicator as MainProcessCommunicator;

    return async function ErrorHandling(ctx, next) {
        try {
            await next();
        } catch (err) {
            ctx.status = err.statusCode || err.status || 400;
            if (_mainProcessCommunicator.isDebug) {
                ctx.body = `<p>错误时间：${moment().format('YYYY-MM-DD HH:mm:ss')}</p><h2>${err.message}</h2><pre>${err.stack}</pre>`;
            } else {
                ctx.body = err.message;
            }
        }
    }
}