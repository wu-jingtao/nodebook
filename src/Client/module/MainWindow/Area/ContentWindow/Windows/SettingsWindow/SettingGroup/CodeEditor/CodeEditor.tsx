import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { NumberInput } from '../../../../../../../../global/Component/NumberInput/NumberInput';
import { CheckBox } from '../../../../../../../../global/Component/CheckBox/CheckBox';
import { normalSettings } from '../../../../../../../../global/SystemSetting';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";

const less = require('./CodeEditor.less');

export class CodeEditor extends BaseSettingGroup {

    private readonly _lineNumbers = normalSettings.get('client.editor.lineNumbers') as ObservableVariable<boolean>;
    private readonly _smoothScrolling = normalSettings.get('client.editor.smoothScrolling') as ObservableVariable<boolean>;
    private readonly _minimap = normalSettings.get('client.editor.minimap') as ObservableVariable<boolean>;
    private readonly _fontSize = normalSettings.get('client.editor.fontSize') as ObservableVariable<number>;

    protected _groupName = '编辑器';

    protected _subGroup = [
        {
            name: '行号',
            description: '是否在编辑器左侧显示代码行号',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._lineNumbers]} render={() => <CheckBox text="显示行号" value={this._lineNumbers} />} />
                )
            ]
        },
        {
            name: '平滑滚动',
            description: '鼠标滚动代码时是否开启滚动动画',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._smoothScrolling]} render={() => <CheckBox text="启用平滑滚动" value={this._smoothScrolling} />} />
                )
            ]
        },
        {
            name: 'minimap',
            description: '是否在滚动条旁边显示代码缩略图',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._minimap]} render={() => <CheckBox text="启用minimap" value={this._minimap} />} />
                )
            ]
        },
        {
            name: '字体大小',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._fontSize]}
                        render={() => <NumberInput className={less.numberInput} min={10} max={30} step={1} value={this._fontSize} />} />
                )
            ]
        },
    ];
}