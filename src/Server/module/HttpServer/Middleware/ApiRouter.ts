import * as koa from 'koa';
import * as koa_compose from 'koa-compose';
import * as koa_router from 'koa-router';

import { SystemSetting } from "../../SystemSetting/SystemSetting";

import { BodyParser } from './BodyParser';

/**
 * 该类主要是负责API路由
 */
export function ApiRouter(systemSetting: SystemSetting): koa.Middleware {

    const router = new koa_router();

    

    return koa_compose([BodyParser(systemSetting), router.routes()]);
}