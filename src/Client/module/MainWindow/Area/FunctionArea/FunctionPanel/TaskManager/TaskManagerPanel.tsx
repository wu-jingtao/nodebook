import * as React from 'react';
import { oSet } from 'observable-variable';

import { FoldableContainer } from '../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { FoldableContainerPropsType } from '../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { createTask, refreshTaskList } from './TaskList';
import { TaskTree } from './TaskTree';

const less = require('./TaskManager.less');

export class TaskManagerPanel extends FoldableContainer<FoldableContainerPropsType> {

    //创建新任务
    private readonly _createTask = async (e: React.MouseEvent) => {
        e.stopPropagation();
        createTask();
    };

    //创建调试任务
    private readonly _createDebugTask = async (e: React.MouseEvent) => {
        e.stopPropagation();
        createTask(undefined, true);
    };

    //刷新任务列表
    private readonly _refreshTaskList = async (e: React.MouseEvent) => {
        e.stopPropagation();
        refreshTaskList();
    };

    protected renderTitleBar(): React.ReactNode {
        return (
            <div className={less.titleButtons}>
                <img title="新建任务" src="/static/res/img/buttons_icon/add_inverse.svg" onClick={this._createTask} />
                <img title="新建调试任务" src="/static/res/img/buttons_icon/debug-dark.svg" onClick={this._createDebugTask} />
                <img title="刷新" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshTaskList} />
            </div>
        );
    }

    protected renderContent(): React.ReactNode {
        return <TaskTree name="任务列表" memorable="_TaskTree" modifiedFiles={oSet<any>([])} />
    }
}