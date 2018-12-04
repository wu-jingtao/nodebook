import * as http from 'http';
import * as net from 'net';
import * as https from 'https';
import * as koa from 'koa';
import * as koa_compose from 'koa-compose';
import * as request from 'request-promise-native';
import * as koa_compress from 'koa-compress';
import * as koa_router from 'koa-router';
import * as ws from 'ws';
import log from 'log-formatter';
import koa_response_time = require('koa-response-time');
import { BaseServiceModule } from "service-starter";

import { OpenSSLCertificate } from '../OpenSSLCertificate/OpenSSLCertificate';
import { MainProcessCommunicator } from '../MainProcess/MainProcessCommunicator';

import { ErrorHandling } from './Middleware/ErrorHandling';
import { HealthCheck, healthCheckingUrlPath } from './Middleware/HealthCheck';
import { VisitRestriction } from './Middleware/VisitRestriction';
import { VisitLogger } from './Middleware/VisitLogger';
import { FileContentHeader } from './Middleware/FileContentHeader';
import { FormParser } from './Middleware/FormParser';
import { LoginCheck } from './Middleware/LoginCheck';
import { registerRouter } from './RegisterRouter';

export class HttpServer extends BaseServiceModule {

    private _openSSLCertificate: OpenSSLCertificate;
    private _mainProcessCommunicator: MainProcessCommunicator;

    private _httpServer: https.Server;
    private _koaServer: koa;
    private _wsServer: ws.Server;

    async onStart(): Promise<void> {
        this._openSSLCertificate = this.services.OpenSSLCertificate;
        this._mainProcessCommunicator = this.services.MainProcessCommunicator;

        //创建服务器
        this._koaServer = new koa();

        this._httpServer = https.createServer({
            key: this._openSSLCertificate.privkey,
            cert: this._openSSLCertificate.cert,
            passphrase: this._openSSLCertificate.password
        }, this._koaServer.callback());

        this._wsServer = new ws.Server({
            noServer: true,
            perMessageDeflate: { zlibDeflateOptions: { chunkSize: 1024, memLevel: 9, level: 9 } }
        });

        //注册koa中间件
        const visitRestriction = VisitRestriction(this);
        this._koaServer.use(HealthCheck());
        this._koaServer.use(visitRestriction);
        this._koaServer.use(VisitLogger(this));
        this._koaServer.use(ErrorHandling(this));
        this._koaServer.use(koa_response_time());
        this._koaServer.use(koa_compress());    //response 头部如果设置了 Content-Encoding 则会使这个无效
        this._koaServer.use(FileContentHeader());
        this._koaServer.use(FormParser(this));

        //创建路由
        const router_login = new koa_router();      //挂在该路由上的会进行身份验证
        const router_no_login = new koa_router();
        const router_ws = new koa_router();         //用于绑定websocket路由，该路由上的中间件通过ctx.handleWs(client:ws)来获取ws连接

        const loginCheck = LoginCheck(this);
        router_login.use(loginCheck);
        router_ws.use(visitRestriction, loginCheck);

        //注册路由
        registerRouter(router_login, router_no_login, router_ws, this);

        //绑定路由
        this._koaServer.use(koa_compose([
            router_login.routes(),
            router_no_login.routes(),
            router_login.allowedMethods(),
            router_no_login.allowedMethods()
        ]));

        //处理websocket upgrade
        const wsMiddleware = koa_compose([router_ws.routes(), router_ws.allowedMethods()]);
        this._httpServer.on('upgrade', (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
            const ctx = this._koaServer.createContext(req, {} as any);
            ctx.handleWs = (callback: (client: ws) => void) => {
                this._wsServer.handleUpgrade(req, socket, head, callback);
            };

            //模拟Koa调用中间件
            wsMiddleware(ctx).catch(err => {
                socket.end();   //出现错误则断开连接

                if (this._mainProcessCommunicator.isDebug)
                    log.error.location.content(ctx.request.path, err);
            });
        });

        //启动监听
        this._httpServer.listen(443);
    }

    onStop(): Promise<void> {
        return new Promise(resolve => {
            this._httpServer.close(resolve);
            setTimeout(resolve, 2000);  //最多等待2秒
        });
    }

    async onHealthCheck(): Promise<void> {
        const path = healthCheckingUrlPath; //这里保存一个是因为健康检查的地址每次都会变

        const result = await request.post(`https://${this._mainProcessCommunicator.domain}${path}`, {
            ca: this._openSSLCertificate.cert,
            rejectUnauthorized: false
        });

        if (path !== result.toString())
            throw new Error(`健康检查的返回值与请求路径不批配`);
    }
}