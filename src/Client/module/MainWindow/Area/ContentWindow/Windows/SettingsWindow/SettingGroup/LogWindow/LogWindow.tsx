import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { NumberInput } from '../../../../../../../../global/Component/NumberInput/NumberInput';
import { CheckBox } from '../../../../../../../../global/Component/CheckBox/CheckBox';
import { normalSettings } from '../../../../../../../../global/SystemSetting';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";

const less_CodeEditor = require('../CodeEditor/CodeEditor.less');

export class LogWindow extends BaseSettingGroup {

    private readonly _terminalFontSize = normalSettings.get('client.terminal.fontSize') as ObservableVariable<number>;
    private readonly _bellSound = normalSettings.get('client.terminal.bellSound') as ObservableVariable<boolean>;
    private readonly _taskLogFontSize = normalSettings.get('client.taskLog.fontSize') as ObservableVariable<number>;
    private readonly _displayTime = normalSettings.get('client.taskLog.displayTime') as ObservableVariable<boolean>;

    protected _groupName = '任务日志与终端窗口';

    protected _subGroup = [
        {
            name: '任务日志字体大小',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._taskLogFontSize]}
                        render={() => <NumberInput className={less_CodeEditor.numberInput} min={10} max={100} step={1} value={this._taskLogFontSize} />} />
                )
            ]
        },
        {
            name: '显示任务日志时间',
            description: '是否在每条任务日志前面显示时间',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._displayTime]} render={() => <CheckBox text="显示时间" value={this._displayTime} />} />
                )
            ]
        },
        {
            name: '终端字体大小',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._terminalFontSize]}
                        render={() => <NumberInput className={less_CodeEditor.numberInput} min={10} max={100} step={1} value={this._terminalFontSize} />} />
                )
            ]
        },
        {
            name: '终端提示音',
            description: '是否开启终端提示音',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._bellSound]} render={() => <CheckBox text="开启提示音" value={this._bellSound} />} />
                )
            ]
        },
    ];
}