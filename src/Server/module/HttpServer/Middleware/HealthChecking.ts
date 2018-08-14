import * as koa from 'koa';
import randomString = require('crypto-random-string');
import { ObservableVariable } from 'observable-variable';

import { SystemSetting } from '../../SystemSetting/SystemSetting';

//配置系统设置变量
SystemSetting.addDynamicSetting('_internal.healthCheckingUrlPath', `/${randomString(31)}`);

/**
 * server健康检查，健康则返回OK
 */
export function HealthChecking(systemSetting: SystemSetting): koa.Middleware {
    //随机生成的url访问地址
    const healthCheckingUrlPath = systemSetting.normalSettings.get('_internal.healthCheckingUrlPath') as ObservableVariable<string>;

    return async function HealthChecking(ctx, next) {
        if (ctx.originalUrl === healthCheckingUrlPath.value && ctx.method === 'POST') {
            ctx.body = 'OK';
            healthCheckingUrlPath.value = `/${randomString(31)}`;   //更新随机访问地址
        } else {
            return next();
        }
    }
}