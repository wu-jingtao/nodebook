import * as KoaBody from 'koa-body';
import { ObservableVariable } from 'observable-variable';

import { SystemSetting } from '../../SystemSetting/SystemSetting';
import { HttpServer } from '../HttpServer';

//设置系统变量默认值
SystemSetting.addSystemSetting('http.uploadFileSizeLimit', 100, false, 'number');    //文件数据上传大小限制，单位MB，默认100MB，最小1MB

/**
 * 表单内容解析工具
 */
export function FormParser(httpServer: HttpServer) {
    const _uploadFileSizeLimit = httpServer.services.SystemSetting.normalSettings.get('http.uploadFileSizeLimit') as ObservableVariable<number>;

    _uploadFileSizeLimit.on('beforeSet', newValue => {
        if (newValue < 1)
            throw new Error('http.uploadFileSizeLimit 的值必须大于1');
    });

    _uploadFileSizeLimit.on('set', newValue => (_config as any).formidable.maxFileSize = newValue * 1024 * 1024);

    const _config: KoaBody.IKoaBodyOptions = {
        json: false,    //不自动解析json
        jsonLimit: 10 * 1024 * 1024,
        formLimit: 10 * 1024 * 1024,
        textLimit: 10 * 1024 * 1024,
        multipart: true,
        formidable: {
            maxFieldsSize: 10 * 1024 * 1024,
            maxFileSize: _uploadFileSizeLimit.value * 1024 * 1024
        }
    };

    return KoaBody(_config);
}