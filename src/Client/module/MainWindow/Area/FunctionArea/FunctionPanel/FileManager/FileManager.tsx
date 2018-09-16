import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { FileManagerPropsType } from './FileManagerPropsType';
import { UserCode } from './component/UserCode/UserCode';

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
                <UserCode
                    title="用户代码"
                    uniqueID="_userCode"
                    fileManagerNumber={this.props.fileManagerNumber}
                    contentWindows={this.props.contentWindows} />
            </div>
        );
    }
}