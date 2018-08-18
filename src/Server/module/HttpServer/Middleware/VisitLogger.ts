import * as koa from 'koa';
import * as koa_logger from 'koa-logger';

import { HttpServer } from '../HttpServer';
import { MainProcessCommunicator } from '../../MainProcess/MainProcessCommunicator';

/**
 * 访问URL打印
 */
export function VisitLogger(httpServer: HttpServer): koa.Middleware {
    const _mainProcessCommunicator = httpServer.services.MainProcessCommunicator as MainProcessCommunicator;

    if (_mainProcessCommunicator.isDebug) {
        return koa_logger();
    } else {
        return function VisitLogger(ctx, next) {
            return next();
        };
    }
}