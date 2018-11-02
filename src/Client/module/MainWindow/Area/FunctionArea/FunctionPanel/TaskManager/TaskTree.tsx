import * as React from 'react';
import { ObservableVariable, watch } from 'observable-variable';

import { FileIconTree } from '../../../../../../global/Component/Tree/FileIconTree/FileIconTree';
import { FileIconTreePropsType } from '../../../../../../global/Component/Tree/FileIconTree/FileIconTreePropsType';
import { ContextMenuItemOptions } from '../../../../../ContextMenu/ContextMenuOptions';
import { taskList, _processingTask, stopTask, restartTask, startTask } from './TaskList';

export class TaskTree extends FileIconTree<FileIconTreePropsType, { status: ObservableVariable<"running" | "stop" | "crashed"> }> {

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

        this._unobserve.push(watch([_processingTask], () => {
            if (_processingTask.includes(this._name))
                this._loading.add('_processing');
            else
                this._loading.delete('_processing');
        }));
    }

    protected async _onOpenItem(e: React.MouseEvent<HTMLDivElement>): Promise<void> {

    }

    protected _onContextMenu(): (ContextMenuItemOptions | void | false)[][] {
        if (this._isRoot || this._loading.size > 0)
            return [];
        else {
            return [
                [
                    this._dataTree.data.status.value === 'running' && { name: '停止任务', callback: () => stopTask(this._name) },
                    this._dataTree.data.status.value === 'running' && { name: '重启任务', callback: () => restartTask(this._name) },
                    this._dataTree.data.status.value !== 'running' && { name: '启动任务', callback: () => startTask(this._name) },
                ]
            ];
        }
    }

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) { return parentProps }
    protected async _onOpenBranch(): Promise<false | void> { }
}