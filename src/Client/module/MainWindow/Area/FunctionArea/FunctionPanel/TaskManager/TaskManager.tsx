import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { displayType } from '../../FunctionArea';

const less = require('./TaskManager.less');

/**
 * 任务管理器
 */
export class TaskManager extends ObservableComponent {

    componentDidMount() {
        this.watch(displayType);
    }

    render() {
        return (
            <div id="TaskManager" style={{ display: displayType.value === 'task' ? 'block' : 'none' }}>
                <span style={{ color: 'red' }}>TaskManager</span>
            </div>
        );
    }
}