import * as koa from 'koa';
import log from 'log-formatter';

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
            ctx.body = err.message;

            if (_mainProcessCommunicator.isDebug)   //打印错误消息
                log.error.location.content(ctx.request.path, err);
        }
    }
}