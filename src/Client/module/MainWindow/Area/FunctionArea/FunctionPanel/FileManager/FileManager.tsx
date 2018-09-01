import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { FileManagerPropsType } from './FileManagerPropsType';

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
            <div id="FileManager" style={{ display: this.props.functionAreaDisplayType.value === 'file' ? 'block' : 'none' }}>
                <span style={{ color: 'red' }}>FileManager</span>
            </div>
        );
    }
}