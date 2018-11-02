import * as React from 'react';
import { ObservableVariable, watch } from 'observable-variable';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { normalSettings } from '../../../../../../global/SystemSetting';
import { displayType } from '../../FunctionArea';
import { TaskManagerPanel } from './TaskManagerPanel';
import { refreshTaskList } from './TaskList';

/**
 * 任务管理器
 */
export class TaskManager extends ObservableComponent {

    componentDidMount() {
        this.watch([displayType]);

        const timerInterval = normalSettings.get('client.task.listRefreshInterval') as ObservableVariable<number>;

        //自动刷新
        let timer: any = setInterval(refreshTaskList, timerInterval.value);

        this._unobserve.push(watch([timerInterval], () => {
            clearInterval(timer);
            timer = setInterval(refreshTaskList, timerInterval.value);
        }));

        this._unobserve.push(() => clearInterval(timer));

        refreshTaskList();
    }

    render() {
        return (
            <div id="TaskManager" style={{ display: displayType.value === 'task' ? 'block' : 'none' }}>
                <TaskManagerPanel noFold title="任务管理器" uniqueID="_TaskManagerPanel" />
            </div>
        );
    }
}