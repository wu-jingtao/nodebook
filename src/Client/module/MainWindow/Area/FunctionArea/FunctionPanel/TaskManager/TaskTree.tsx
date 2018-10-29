import * as React from 'react';
import { ObservableVariable, watch } from 'observable-variable';

import { ServerApi } from '../../../../../../global/ServerApi';
import { FileIconTree } from '../../../../../../global/Component/Tree/FileIconTree/FileIconTree';
import { FileIconTreePropsType } from '../../../../../../global/Component/Tree/FileIconTree/FileIconTreePropsType';
import { ContextMenuItemOptions } from '../../../../../ContextMenu/ContextMenuOptions';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { taskList } from './TaskManager';

export class TaskTree extends FileIconTree<FileIconTreePropsType, { status: ObservableVariable<"running" | "stop" | "crashed"> }> {

    //表示整个任务列表是否正在处理中
    public processing = this._root._loading;

    //启动任务
    private readonly _startTask = async () => {
        if (this._dataTree.data.status.value !== 'running') {
            if (!this._loading.has('_startTask')) {
                try {
                    this._loading.add('_startTask');
                    await ServerApi.task.createTask(this._name);
                    this._dataTree.data.status.value = await ServerApi.task.getTaskStatus(this._name) || 'stop';
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '启动任务失败', content: error.message });
                } finally {
                    this._loading.delete('_startTask');
                }
            }
        }
    };

    //停止任务
    private readonly _stopTask = async () => {
        if (this._dataTree.data.status.value === 'running') {
            if (!this._loading.has('_stopTask')) {
                try {
                    this._loading.add('_stopTask');
                    await ServerApi.task.destroyTask(this._name);
                    this._dataTree.data.status.value = await ServerApi.task.getTaskStatus(this._name) || 'stop';
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '停止任务失败', content: error.message });
                } finally {
                    this._loading.delete('_stopTask');
                }
            }
        }
    };

    //重启任务
    private readonly _restartTask = async () => {
        await this._stopTask();
        await this._startTask();
    };

    constructor(props: any, context: any) {
        super(props, context);

        if (this._isRoot) {
            const taskAdd = (status: ObservableVariable<"running" | "stop" | "crashed">, path: string) => {
                (this._dataTree.subItem as any).set(path, { name: path, data: { status } });
            }

            const taskRemove = (status: ObservableVariable<"running" | "stop" | "crashed">, path: string) => {
                (this._dataTree.subItem as any).delete(path);
            }

            taskList.on('add', taskAdd);
            taskList.on('remove', taskRemove);

            this._unobserve.push(() => {
                taskList.off('add', taskAdd);
                taskList.off('remove', taskRemove);
            });

            taskList.forEach(taskAdd);
        } else {
            const setIconAndText = () => {
                this._fileIcon_url.value = `/static/res/img/buttons_icon/task-${this._dataTree.data.status.value}.svg`;
                this._fileIcon_displayContent.value = (
                    <>
                        ({this._dataTree.data.status.value === 'running' ? '正在运行' :
                            this._dataTree.data.status.value === 'stop' ? '停止' : '崩溃'})&nbsp;
                        {this._name}
                    </>
                );
            };

            this._unobserve.push(watch([this._dataTree.data.status], setIconAndText));
            setIconAndText();
        }
    }

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
        return parentProps;
    }

    protected async _onOpenBranch(): Promise<false | void> { }

    protected async _onOpenItem(e: React.MouseEvent<HTMLDivElement>): Promise<void> {

    }

    protected _onContextMenu(): (ContextMenuItemOptions | void | false)[][] {
        if (this._isRoot || this._loading.size > 0)
            return [];
        else {
            return [
                [
                    this._dataTree.data.status.value === 'running' && { name: '停止', callback: this._stopTask },
                    this._dataTree.data.status.value === 'running' && { name: '重启', callback: this._restartTask },
                    this._dataTree.data.status.value !== 'running' && { name: '启动', callback: this._startTask },
                ]
            ];
        }
    }
}