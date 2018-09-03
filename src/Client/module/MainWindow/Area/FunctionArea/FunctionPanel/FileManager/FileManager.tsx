import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { FileManagerPropsType } from './FileManagerPropsType';
import { FileBrowser } from './Component/FileBrowser/FileBrowser';

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
                <div className={less.title}>资源管理器</div>
                <FileBrowser title="用户代码" uniqueName="userCode" />
            </div>
        );
    }
}