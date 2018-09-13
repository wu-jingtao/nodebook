import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponent } from "../../../../Tools/ObservableComponent";
import { FileIcon } from '../../../FileIcon/FileIcon';

const less = require('./InputFileName.less');

/**
 * 上传文件
 */
export class UploadFile extends ObservableComponent<{ file: ObservableVariable<File | undefined> }> {

    componentDidMount() {
        this.watch(this.props.file);
    }

    render() {
        const filename = this.props.file.value ? this.props.file.value.name : '';
        return (
            <div className={less.UploadFile}>
                <FileIcon className={less.icon} filename={filename} />
                <div className={less.filename}>{filename}</div>
                <label >
                    <input type="file" style={{ display: 'none' }} onChange={(e: any) => this.props.file.value = e.target.files[0]} />
                    <button className={less.selectFile}>选择文件</button>
                </label>
            </div>
        );
    }
}