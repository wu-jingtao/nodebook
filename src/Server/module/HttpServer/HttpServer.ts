import * as https from 'https';
import * as koa from 'koa';
import * as request from 'request-promise-native';
import * as koa_compress from 'koa-compress';
import koa_response_time = require('koa-response-time');
import { BaseServiceModule } from "service-starter";

import { SystemSetting } from '../SystemSetting/SystemSetting';
import { OpenSSLCertificate } from '../OpenSSLCertificate/OpenSSLCertificate';

import { ErrorHandling } from './Middleware/ErrorHandling';
import { HealthCheck, healthCheckingUrlPath } from './Middleware/HealthCheck';
import { VisitRestriction } from './Middleware/VisitRestriction';
import { VisitLogger } from './Middleware/VisitLogger';
import { Router } from './Middleware/Router';

export class HttpServer extends BaseServiceModule {

    private _systemSetting: SystemSetting;
    private _openSSLCertificate: OpenSSLCertificate;

    private _httpServer: https.Server;
    private _koaServer: koa;

    /**
     * 注册koa中间件
     */
    private async _registerMiddleware() {
        this._koaServer.use(HealthCheck());
        this._koaServer.use(VisitRestriction(this._systemSetting));
        this._koaServer.use(VisitLogger());
        this._koaServer.use(ErrorHandling());
        this._koaServer.use(koa_response_time());
        this._koaServer.use(koa_compress());    //response 头部如果设置了 Content-Encoding 则会使这个无效
        this._koaServer.use(Router(this));
    }

    async onStart(): Promise<void> {
        this._systemSetting = this.services.SystemSetting;
        this._openSSLCertificate = this.services.OpenSSLCertificate;

        this._koaServer = new koa();
        this._httpServer = https.createServer({ key: this._openSSLCertificate.privkey, cert: this._openSSLCertificate.cert }, this._koaServer.callback());

        await this._registerMiddleware();

        this._httpServer.listen(443);
    }

    onStop(): Promise<void> {
        return new Promise(resolve => {
            this._httpServer.close(resolve);
        });
    }

    async onHealthCheck(): Promise<void> {
        const result = (await request.post(`https://${process.env.DOMAIN}${healthCheckingUrlPath}`, { ca: this._openSSLCertificate.cert })).toString();
        if ("OK" !== result)
            throw new Error(`健康检查的返回值错误。${result}`);
    }
}