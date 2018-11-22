import * as React from 'react';
import * as classnames from 'classnames';
import { watch } from 'observable-variable';

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
            let name = this.props.name.value;
            if (name === '') {
                if (this.props.isDirectory) {
                    this.props.errorTip.set(1, '名称不能为空');
                    this.forceUpdate();
                    return;
                } else
                    name = filePath.split('/').pop() as string;
            }

            if (this.props.isRename && name === originalName)
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
            <div className={classnames(less.InputShortcutName, { [less.error]: this.props.errorTip.some(item => item.length > 0) })}>
                {
                    this.props.isDirectory ?
                        (<>
                            <FileIcon className={less.icon} isFolder filename={this.props.name.value} />
                            <TextInput className={less.input} placeholder="请输入文件夹名称" type="text" value={this.props.name} autoFocus />
                        </>) :
                        (<>
                            <FileIcon className={less.icon} filename={this.props.filePath.value.split('/').pop() as string} />
                            <TextInput className={classnames(less.input, less.input_filePath)} placeholder="请输入对应文件的绝对路径" type="text" value={this.props.filePath} autoFocus />
                            <div className={less.selectFile} onClick={this._selectFile}>选择文件</div>
                            <div className={less.shortcutName}>快捷方式名称</div>
                            <TextInput className={classnames(less.input, less.input_shortcutName)} placeholder={this.props.filePath.value.split('/').pop()} type="text" value={this.props.name} />
                        </>)
                }
                {
                    this.props.errorTip.map((item, index) =>
                        item && <div key={index} className={less.errorTip}>{item}</div>
                    )
                }
            </div >
        );
    }
}