import * as React from 'react';
import { oMap, ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { displayType } from '../../FunctionArea';
import { TaskManagerPanel } from './TaskManagerPanel';

/**
 * 任务列表。key是运行文件的绝对路径，value是当前任务的运行状态。当某个任务不存在的时候会触发remove事件
 */
export const taskList = oMap<string, ObservableVariable<'running' | 'stop' | 'crashed'>>([]);

/**
 * 任务管理器
 */
export class TaskManager extends ObservableComponent {

    componentDidMount() {
        this.watch([displayType]);
    }

    render() {
        return (
            <div id="TaskManager" style={{ display: displayType.value === 'task' ? 'block' : 'none' }}>
                <TaskManagerPanel noFold title="任务管理器" uniqueID="_TaskManagerPanel" />
            </div>
        );
    }
}