import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { NumberInput } from '../../../../../../../../global/Component/NumberInput/NumberInput';
import { CheckBox } from '../../../../../../../../global/Component/CheckBox/CheckBox';
import { normalSettings } from '../../../../../../../../global/SystemSetting';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";

const less_CodeEditor = require('../CodeEditor/CodeEditor.less');

export class Terminal extends BaseSettingGroup {

    private readonly _fontSize = normalSettings.get('client.terminal.fontSize') as ObservableVariable<number>;
    private readonly _bellSound = normalSettings.get('client.terminal.bellSound') as ObservableVariable<boolean>;

    protected _groupName = '终端';

    protected _subGroup = [
        {
            name: '字体大小',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._fontSize]}
                        render={() => <NumberInput className={less_CodeEditor.numberInput} min={10} max={100} step={1} value={this._fontSize} />} />
                )
            ]
        },
        {
            name: '提示音',
            description: '是否开启终端提示音',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._bellSound]} render={() => <CheckBox text="开启提示音" value={this._bellSound} />} />
                )
            ]
        },
    ];
}