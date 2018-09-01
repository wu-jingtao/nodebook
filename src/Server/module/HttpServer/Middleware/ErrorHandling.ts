import * as koa from 'koa';
import log from 'log-formatter';

import { HttpServer } from '../HttpServer';
import { MainProcessCommunicator } from '../../MainProcess/MainProcessCommunicator';

/**
 * 错误处理方法
 */
export function ErrorHandling(httpServer: HttpServer): koa.Middleware {
    const _mainProcessCommunicator = httpServer.services.MainProcessCommunicator as MainProcessCommunicator;

    return async function ErrorHandling(ctx, next) {
        try {
            await next();
        } catch (err) {
            ctx.status = err.statusCode || err.status || 400;
            ctx.body = err.message;

            //是否开启了debug模式。如果开启了,则会将错误的堆栈信息打印到控制台
            if (_mainProcessCommunicator.isDebug)
                log.error.location.content(ctx.request.path, err);
        }
    }
}