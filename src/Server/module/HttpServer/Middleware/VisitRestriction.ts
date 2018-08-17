import * as _ from 'lodash';
import * as koa from 'koa';
import { ObservableVariable } from 'observable-variable';

import { HttpServer } from '../HttpServer';
import { SystemSetting } from "../../SystemSetting/SystemSetting";

//设置系统变量默认值
SystemSetting.addSystemSetting('http.ipWhiteListRegexp', undefined, true, true);    //ip访问白名单正则表达式。如果设置了白名单则黑名单将失效
SystemSetting.addSystemSetting('http.ipBlackListRegexp', undefined, true, true);    //ip访问黑名单正则表达式

/**
 * 访问限制，用于限制IP地址以及域名
 */
export function VisitRestriction(httpServer: HttpServer): koa.Middleware {
    const _systemSetting = httpServer.services.SystemSetting as SystemSetting;
    const _domain = (process.env.DOMAIN || '').toLowerCase();

    const _ipWhiteListRegexp = _systemSetting.secretSettings.get('http.ipWhiteListRegexp') as ObservableVariable<string>;
    const _ipBlackListRegexp = _systemSetting.secretSettings.get('http.ipBlackListRegexp') as ObservableVariable<string>;

    let _ip_white: RegExp = _.isString(_ipWhiteListRegexp.value) ? new RegExp(_ipWhiteListRegexp.value) : undefined as any;
    let _ip_black: RegExp = _.isString(_ipBlackListRegexp.value) ? new RegExp(_ipBlackListRegexp.value) : undefined as any;

    _ipWhiteListRegexp.on('set', newValue => _ip_white = _.isString(newValue) ? new RegExp(newValue) : undefined as any);
    _ipBlackListRegexp.on('set', newValue => _ip_black = _.isString(newValue) ? new RegExp(newValue) : undefined as any);

    return async function VisitRestriction(ctx, next) {
        if (_domain === ctx.host) { //ctx.host 格式："localhost:3000"
            if (_ip_white !== undefined) {
                if (_ip_white.test(ctx.ip))
                    return next();
            } else if (_ip_black !== undefined) {
                if (!_ip_black.test(ctx.ip))
                    return next();
            } else {
                return next();
            }
        }

        ctx.throw(403);
    }
}