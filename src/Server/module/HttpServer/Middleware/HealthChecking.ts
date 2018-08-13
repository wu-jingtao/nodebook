import * as koa from 'koa';
import randomString = require('crypto-random-string');

/**
 * 随机生成的url访问地址
 */
export const HealthCheckingUrlPath = '/' + randomString(31);

/**
 * server健康检查，健康则返回OK
 */
export function HealthChecking(): koa.Middleware {
    return async function HealthChecking(ctx, next) {
        if (ctx.originalUrl === HealthCheckingUrlPath && ctx.method === 'POST') {
            ctx.body = 'OK';
        } else {
            return next();
        }
    }
}