import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { DropDownList } from '../../../../../../global/Component/DropDownList/DropDownList';
import { displayType } from '../../LogWindow';
import { taskLogWindowList, focusedTaskLogWindow } from './TaskLogWindowList';
import { _communicator } from './TaskLogWindowContent';

const less = require('./TaskLogWindow.less');

export class TaskLogWindowFunctionArea extends ObservableComponent {

    private readonly _closeTaskLogWindow = () => {
        if (focusedTaskLogWindow.value) {
            taskLogWindowList.delete(focusedTaskLogWindow.value);
            focusedTaskLogWindow.value = taskLogWindowList.last || '';
        }
    };

    private readonly _cleanTaskLog = () => {
        if (focusedTaskLogWindow.value)
            _communicator.get(focusedTaskLogWindow.value).cleanTaskLog();
    };

    componentDidMount() {
        this.watch([displayType, taskLogWindowList, focusedTaskLogWindow]);
    }

    render() {
        return (
            <div className={less.TaskLogWindowFunctionArea} style={{ display: displayType.value === 'log' ? 'flex' : 'none' }}>
                <DropDownList className={less.dropDownList} value={focusedTaskLogWindow}
                    options={taskLogWindowList.map(item => ({ text: item, value: item }))} />
                <img className={less.functionButton} src="/static/res/img/buttons_icon/clear-inverse.svg"
                    title="清空任务日志" onClick={this._cleanTaskLog} />
                <img className={less.functionButton} src="/static/res/img/buttons_icon/kill-inverse.svg"
                    title="关闭任务日志" onClick={this._closeTaskLogWindow} />
            </div>
        );
    }
}