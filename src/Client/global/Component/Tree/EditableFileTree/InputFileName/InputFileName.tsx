import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, ObservableMap } from 'observable-variable';

import { ObservableComponent } from "../../../../Tools/ObservableComponent";
import { FileIcon } from '../../../FileIcon/FileIcon';
import { TextInput } from '../../../TextInput/TextInput';

const less = require('./InputFileName.less');

/**
 * 输入文件名称
 */
export class InputFileName extends ObservableComponent<{ name: ObservableVariable<string>, subItems: ObservableMap<string, any>, isDirectory?: boolean, isRename?: boolean }> {

    componentDidMount() {
        this.watch(this.props.name);
    }

    render() {
        let errorTip;

        if (!/^[^<>/\\\|:""\*\?]+$/.test(this.props.name.value))
            errorTip = '文件命中不能包含特殊字符';
        else if (this.props.name.value === '.')
            errorTip = "文件名不能为'.'";
        else if (this.props.name.value === '..')
            errorTip = "文件名不能为'..'";
        else if (!this.props.isRename && this.props.subItems.has(this.props.name.value))
            errorTip = '文件名重复';

        return (
            <div className={classnames(less.InputFileName, { [less.error]: errorTip !== undefined })}>
                <FileIcon className={less.icon} isFolder={this.props.isDirectory} filename={this.props.name.value} />
                <TextInput className={less.input} placeholder="请输入文件名称" maxLength={100} type="text" value={this.props.name} />
                {errorTip && <div className={less.errorTip}>{errorTip}</div>}
            </div>
        );
    }
}