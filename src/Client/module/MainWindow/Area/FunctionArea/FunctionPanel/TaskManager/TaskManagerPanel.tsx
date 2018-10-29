import * as React from 'react';
import { oVar, ObservableVariable, watch, oSet } from 'observable-variable';

import { FoldableContainer } from '../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { FoldableContainerPropsType } from '../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { normalSettings } from '../../../../../../global/SystemSetting';
import { ServerApi } from '../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { selectFile } from '../ShortcutManager/SelectFile/SelectFile';
import { taskList } from './TaskManager';
import { TaskTree } from './TaskTree';

const less = require('./TaskManager.less');

export class TaskManagerPanel extends FoldableContainer<FoldableContainerPropsType> {

    private _tree: TaskTree;

    //创建新任务
    private readonly _createTask = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const filePath = await selectFile(/\.server\.js$/);

            if (filePath && (!taskList.has(filePath) || taskList.get(filePath).value !== 'running')) {
                this._tree.processing.add('_createTask');
                await ServerApi.task.createTask(filePath);
                this._refreshTaskList();
            }
        } catch (error) {
            showMessageBox({ icon: 'error', title: '创建任务失败', content: error.message });
        } finally {
            this._tree.processing.delete('_createTask');
        }
    };

    //属性任务列表
    private readonly _refreshTaskList = async (e?: React.MouseEvent) => {
        e && e.stopPropagation();

        if (!this._tree.processing.has('_refreshTaskList')) {
            try {
                this._tree.processing.add('_refreshTaskList');

                const data = await ServerApi.task.getAllTaskStatus();

                //删除已经不再存在的任务
                for (const path of taskList.keys()) {
                    if (data.every(item => item.path !== path))
                        taskList.delete(path);
                }

                //更新或添加任务
                for (const item of data) {
                    if (taskList.has(item.path))
                        taskList.get(item.path).value = item.status;
                    else
                        taskList.set(item.path, oVar(item.status));
                }
            } catch (error) {
                showMessageBox({ icon: 'error', title: '刷新任务列表失败', content: error.message });
            } finally {
                this._tree && this._tree.processing.delete('_refreshTaskList');
            }
        }
    };

    protected renderTitleBar(): React.ReactNode {
        return (
            <div className={less.titleButtons}>
                <img title="新建任务" src="/static/res/img/buttons_icon/AddFile_inverse.svg" onClick={this._createTask} />
                <img title="刷新" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshTaskList} />
            </div>
        );
    }

    protected renderContent(): React.ReactNode {
        return <TaskTree name="任务列表" memorable="_TaskTree" modifiedFiles={oSet<any>([])} ref={(e: any) => this._tree = e} />
    }

    componentDidMount() {
        super.componentDidMount();

        const timerInterval = normalSettings.get('client.task.listRefreshInterval') as ObservableVariable<number>;

        //自动刷新
        let timer: any = setInterval(this._refreshTaskList, timerInterval.value);

        this._unobserve.push(watch([timerInterval], () => {
            clearInterval(timer);
            timer = setInterval(this._refreshTaskList, timerInterval.value);
        }));

        this._unobserve.push(() => clearInterval(timer));

        this._refreshTaskList();
    }
}

