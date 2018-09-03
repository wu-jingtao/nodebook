import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { FileManagerPropsType } from './FileManagerPropsType';
import { FileBrowser } from './FileBrowser/FileBrowser';

const less = require('./FileManager.less');

/**
 * 文件资源管理器
 */
export class FileManager extends ObservableComponent<FileManagerPropsType> {

    componentDidMount() {
        this.watch(this.props.functionAreaDisplayType);

    }

    render() {
        return (
            <div id="FileManager" style={{ display: this.props.functionAreaDisplayType.value === 'file' ? 'flex' : 'none' }}>
                <div className={less.header}>资源管理器</div>
                <FileBrowser title="用户代码2" uniqueID="userCode2" scrollable />
                <FileBrowser title="用户代码3" uniqueID="userCode3" scrollable />
                <FileBrowser title="用户代码4" uniqueID="userCode4" scrollable />
            </div>
        );
    }
}