import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { displayType } from '../../FunctionArea';
import { UserCode } from './component/UserCode/UserCode';

const less = require('./FileManager.less');

/**
 * 文件资源管理器
 */
export class FileManager extends ObservableComponent {

    componentDidMount() {
        this.watch(displayType);
    }

    render() {
        return (
            <div id="FileManager" style={{ display: displayType.value === 'file' ? 'flex' : 'none' }}>
                <div className={less.header}>资源管理器</div>
                <UserCode title="用户代码"  uniqueID="_userCode"/>
            </div>
        );
    }
}