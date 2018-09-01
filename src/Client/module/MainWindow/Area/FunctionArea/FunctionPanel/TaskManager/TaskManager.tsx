import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { TaskManagerPropsType } from './TaskManagerPropsType';

const less = require('./TaskManager.less');

/**
 * 任务管理器
 */
export class TaskManager extends ObservableComponent<TaskManagerPropsType> {

    componentDidMount() {
        this.watch(this.props.functionAreaDisplayType);
    }

    render() {
        return (
            <div id="TaskManager" style={{ display: this.props.functionAreaDisplayType.value === 'task' ? 'block' : 'none' }}>
                <span style={{ color: 'red' }}>TaskManager</span>
            </div>
        );
    }
}