import * as _ from 'lodash';
import * as KoaBody from 'koa-body';
import { ObservableVariable } from 'observable-variable';

import { SystemSetting } from '../../SystemSetting/SystemSetting';

//设置系统变量默认值
SystemSetting.addSystemSetting('http.uploadSizeLimit', 100, true, false);    //http 数据上传大小限制，单位MB，默认100MB，最小1MB

/**
 * 表单内容解析工具
 */
export function BodyParser(systemSetting: SystemSetting) {
    const _uploadSizeLimit = systemSetting.normalSettings.get('http.uploadSizeLimit') as ObservableVariable<number>;

    _uploadSizeLimit.on('beforeSet', newValue => {
        if (!_.isNumber(newValue))
            throw new Error('http.uploadSizeLimit 属性的类型必须是数字');

        if (newValue < 1)
            throw new Error('http.uploadSizeLimit 的值必须大于1');
    });

    const _config: KoaBody.IKoaBodyOptions = {
        jsonLimit: _uploadSizeLimit.value * 1024 * 1024,
        formLimit: _uploadSizeLimit.value * 1024 * 1024,
        textLimit: _uploadSizeLimit.value * 1024 * 1024,
        multipart: true,
        urlencoded: false,
        json: false,    //不解析json格式的body
    };

    _uploadSizeLimit.on('set', newValue => {
        _config.jsonLimit = newValue * 1024 * 1024;
        _config.formLimit = newValue * 1024 * 1024;
        _config.textLimit = newValue * 1024 * 1024;
    });

    return KoaBody(_config);
}