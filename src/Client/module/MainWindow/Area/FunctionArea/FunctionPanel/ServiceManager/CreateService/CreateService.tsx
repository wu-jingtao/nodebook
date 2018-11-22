import * as React from 'react';
import * as classnames from 'classnames';
import { watch } from 'observable-variable';

import { ObservableComponent } from '../../../../../../../global/Tools/ObservableComponent';
import { FileIcon } from '../../../../../../../global/Component/FileIcon/FileIcon';
import { TextInput } from '../../../../../../../global/Component/TextInput/TextInput';
import { selectFile } from '../../ShortcutManager/SelectFile/SelectFile';
import { CreateServicePropsType } from './CreateServicePropsType';
import { CheckBox } from '../../../../../../../global/Component/CheckBox/CheckBox';

const less = require('./CreateService.less');

/**
 * 输入快捷方式名称
 */
export class CreateService extends ObservableComponent<CreateServicePropsType> {

    private readonly _selectFile = async () => {
        const path = await selectFile(/\.server\.js$/, this.props.filePath.value);
        if (path) this.props.filePath.value = path;
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.watch([this.props.autoRestart, this.props.reportError]);

        const originalName = this.props.name.value;

        this._unobserve.push(watch([this.props.name, this.props.filePath], () => {
            //验证filePath
            const filePath = this.props.filePath.value;
            if (filePath === '')
                this.props.errorTip.set(0, '文件路径不能为空');
            else if (!/^(\/user_data\/code\/).*?[^\/]$/.test(filePath))
                this.props.errorTip.set(0, '文件路径错误');
            else
                this.props.errorTip.set(0, '');

            //验证name
            let name = this.props.name.value || filePath.split('/').pop() as string;
            if (this.props.isModify && name === originalName)
                this.props.errorTip.set(1, '');
            else if (this.props.subItems.has(name))
                this.props.errorTip.set(1, '名称重复');
            else
                this.props.errorTip.set(1, '');

            this.forceUpdate();
        }));
    }

    render() {
        return (
            <div className={classnames(less.CreateService, { [less.error]: this.props.errorTip.some(item => item.length > 0) })}>
                <FileIcon className={less.icon} filename={this.props.filePath.value.split('/').pop() as string} />
                <TextInput className={classnames(less.input, { [less.input_filePath]: !this.props.isModify })}
                    placeholder="请输入运行文件的绝对路径" type="text" disabled={this.props.isModify} value={this.props.filePath} autoFocus />
                {!this.props.isModify && <div className={less.selectFile} onClick={this._selectFile}>选择文件</div>}
                <div className={less.serviceName}>服务名称</div>
                <TextInput className={classnames(less.input, less.input_serviceName)} placeholder={this.props.filePath.value.split('/').pop()} type="text" value={this.props.name} />
                <CheckBox className={less.checkbox} value={this.props.autoRestart} text="自动重启" />
                <CheckBox className={less.checkbox} value={this.props.reportError} text="崩溃自动报告异常" />
                {this.props.errorTip.map((item, index) =>
                    item && <div key={index} className={less.errorTip}>{item}</div>
                )}
            </div>
        );
    }
}