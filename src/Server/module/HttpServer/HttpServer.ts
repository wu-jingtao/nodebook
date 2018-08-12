import * as http2 from 'http2';
import * as koa from 'koa';
import * as request from 'request';
import { BaseServiceModule } from "service-starter";

import { SystemSetting } from '../SystemSetting/SystemSetting';

export class HttpServer extends BaseServiceModule {

    private _httpServer: http2.Http2Server;
    private _systemSetting: SystemSetting;

    async onStart(): Promise<void> {
        this._systemSetting = this.services.SystemSetting;
    }

    onStop(): Promise<void> {
        return new Promise(resolve => {
            this._httpServer.close(resolve);
        });
    }

    async onHealthCheck(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}