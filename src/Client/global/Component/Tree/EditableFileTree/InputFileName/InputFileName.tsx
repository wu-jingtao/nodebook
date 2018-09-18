import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent } from "../../../../Tools/ObservableComponent";
import { FileIcon } from '../../../FileIcon/FileIcon';
import { TextInput } from '../../../TextInput/TextInput';
import { InputFileNamePropsType } from './InputFileNamePropsType';

const less = require('./InputFileName.less');

/**
 * 输入文件名称
 */
export class InputFileName extends ObservableComponent<InputFileNamePropsType> {

    constructor(props: any, context: any) {
        super(props, context);

        this.watch(this.props.name);

        const originalName = this.props.name.value;

        const validator = (value: string) => {
            if (value === '')
                this.props.errorTip.value = '文件名不能为空';
            else if (/[<>/\\\|:""\*\?]+/.test(value))
                this.props.errorTip.value = '文件名中不能包含特殊字符';
            else if (value === '.')
                this.props.errorTip.value = "文件名不能为 '.'";
            else if (value === '..')
                this.props.errorTip.value = "文件名不能为 '..'";
            else if (this.props.isRename && value === originalName)
                this.props.errorTip.value = '';
            else if (this.props.subItems.has(value))
                this.props.errorTip.value = '文件名重复';
            else if (this.props.extraValidation)
                this.props.errorTip.value = this.props.extraValidation(value);
            else
                this.props.errorTip.value = '';
        }

        this.props.name.on('beforeSet', validator);

        if (this.props.name.value)  //如果有默认文件名就先验证一下默认文件名
            validator(this.props.name.value);
    }

    render() {
        return (
            <div className={classnames(less.InputFileName, { [less.error]: this.props.errorTip.value })}>
                <FileIcon className={less.icon} isFolder={this.props.isDirectory} filename={this.props.name.value} />
                <TextInput className={less.input} placeholder="请输入文件名称" maxLength={100} type="text" value={this.props.name} autoFocus/>
                {this.props.errorTip.value && <div className={less.errorTip}>{this.props.errorTip.value}</div>}
            </div>
        );
    }
}