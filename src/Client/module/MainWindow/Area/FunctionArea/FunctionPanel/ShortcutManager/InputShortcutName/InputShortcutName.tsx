import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent } from '../../../../../../../global/Tools/ObservableComponent';
import { FileIcon } from '../../../../../../../global/Component/FileIcon/FileIcon';
import { TextInput } from '../../../../../../../global/Component/TextInput/TextInput';
import { InputShortcutNamePropsType } from './InputShortcutNamePropsType';
import { selectFile } from '../SelectFile/SelectFile';

const less = require('./InputShortcutName.less');

/**
 * 输入快捷方式名称
 */
export class InputShortcutName extends ObservableComponent<InputShortcutNamePropsType> {

    private readonly _selectFile = async () => {
        const path = await selectFile(new RegExp(''), this.props.filePath.value);
        if (path) this.props.filePath.value = path;
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.watch([this.props.name, this.props.filePath]);

        const originalName = this.props.name.value;

        this.props.filePath.on('beforeSet', value => {
            if (value === '')
                this.props.errorTip.set(0, '文件路径不能为空');
            else if (!/^(\/user_data\/code\/).*?[^\/]$/.test(value))
                this.props.errorTip.set(0, '文件路径错误');
            else
                this.props.errorTip.set(0, '');
        });

        this.props.name.on('beforeSet', value => {
            if (this.props.isDirectory && value === '')
                this.props.errorTip.set(1, '名称不能为空');
            else if (this.props.isRename && value === originalName)
                this.props.errorTip.set(1, '');
            else if (this.props.subItems.has(value))
                this.props.errorTip.set(1, '名称重复');
            else
                this.props.errorTip.set(1, '');
        });
    }

    render() {
        return (
            <div className={classnames(less.InputShortcutName, { [less.error]: this.props.errorTip.some(item => item.length > 0) })}>
                {this.props.isDirectory ?
                    (<>
                        <FileIcon className={less.icon} isFolder filename={this.props.name.value} />
                        <TextInput className={less.input} placeholder="请输入文件夹名称" type="text" value={this.props.name} autoFocus />
                    </>) :
                    (<>
                        <FileIcon className={less.icon} filename={this.props.filePath.value} />
                        <TextInput className={classnames(less.input, less.input_filePath)} placeholder="请输入对应文件的绝对路径" type="text" value={this.props.filePath} autoFocus />
                        <div className={less.selectFile} onClick={this._selectFile}>选择文件</div>
                        <div className={less.shortcutName}>快捷方式名称</div>
                        <TextInput className={classnames(less.input, less.input_shortcutName)} placeholder={this.props.filePath.value.split('/').pop()} type="text" value={this.props.name} />
                    </>)
                }
                {this.props.errorTip.map((item, index) =>
                    item && <div key={index} className={less.errorTip}>{item}</div>
                )}
            </div>
        );
    }
}