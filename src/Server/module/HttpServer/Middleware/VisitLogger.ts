import * as koa from 'koa';
import * as koa_logger from 'koa-logger';

/**
 * 访问URL打印
 */
export function VisitLogger(): koa.Middleware {
    //是否开启了debug模式。
    const _isDebug = (process.env.DEBUG || '').toLowerCase() === 'true';

    if (_isDebug) {
        return koa_logger();
    } else {
        return function VisitLogger(ctx, next) {
            return next();
        };
    }
}