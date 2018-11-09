import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { NumberInput } from '../../../../../../../../global/Component/NumberInput/NumberInput';
import { normalSettings } from '../../../../../../../../global/SystemSetting';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";

const less_CodeEditor = require('../CodeEditor/CodeEditor.less');

export class UploadFile extends BaseSettingGroup {

    private readonly _uploadFileSizeLimit = normalSettings.get('http.uploadFileSizeLimit') as ObservableVariable<number>;

    protected _groupName = '文件上传';

    protected _subGroup = [
        {
            name: '上传文件大小限制',
            description: '(MB)',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._uploadFileSizeLimit]}
                        render={() => <NumberInput className={less_CodeEditor.numberInput} min={1} max={1024 * 1024} step={1} value={this._uploadFileSizeLimit} />} />
                )
            ]
        },
    ];
}