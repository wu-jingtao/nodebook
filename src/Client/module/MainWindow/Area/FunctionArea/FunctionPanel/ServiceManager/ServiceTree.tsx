import * as React from 'react';
import { ObservableVariable, watch, oVar, oArr } from 'observable-variable';

import { ServerApi } from '../../../../../../global/ServerApi';
import { FileIconTree } from '../../../../../../global/Component/Tree/FileIconTree/FileIconTree';
import { FileIconTreePropsType } from '../../../../../../global/Component/Tree/FileIconTree/FileIconTreePropsType';
import { DeleteFiles } from '../../../../../../global/Component/Tree/EditableFileTree/DeleteFiles/DeleteFiles';
import { ContextMenuItemOptions } from '../../../../../ContextMenu/ContextMenuOptions';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { showPopupWindow } from '../../../../../PopupWindow/PopupWindow';
import { ServiceWindowArgs, WindowType } from '../../../ContentWindow/ContentWindowTypes';
import { openWindow, closeWindowByPath } from '../../../ContentWindow/WindowList';
import { taskList, startTask, stopTask, restartTask, _processingTask, refreshTaskList } from '../TaskManager/TaskList';
import { serviceList, ServiceListValueType } from './ServiceManager';
import { CreateService } from './CreateService/CreateService';

const less = require('./ServiceManager.less');

export class ServiceTree extends FileIconTree<FileIconTreePropsType, ServiceListValueType & { status: ObservableVariable<"running" | "stop" | "crashed"> }> {

    //删除服务
    private readonly _deleteService = () => {
        if (!this._focusedItem.has(this)) {
            this._focusedItem.clear();
            this._focusedItem.add(this);
        }

        const deleteItems = [...this._focusedItem.values()].filter(item => !item._isRoot);

        if (deleteItems.every(item => item._loading.size === 0)) {
            showPopupWindow({
                title: '确定要删除一下服务吗?',
                content: <DeleteFiles items={deleteItems.map(item => ({
                    name: item._dataTree.data.name.value,
                    fullName: item._name,
                    isDirectory: false
                }))} />,
                ok: {
                    callback: async () => {
                        try {
                            deleteItems.forEach(item => item._loading.add('_deleteService'));
                            await Promise.all(deleteItems.map(item => ServerApi.task.deleteService(item._name)));
                        } catch (error) {
                            showMessageBox({ icon: 'error', title: '删除服务失败', content: error.message });
                        } finally {
                            await this.refreshServiceList();
                            deleteItems.forEach(item => {
                                item._loading.delete('_deleteService');
                                closeWindowByPath(item._name, undefined, [WindowType.service]);
                            });
                        }
                    }
                }
            });
        } else
            showMessageBox({ icon: 'warning', title: '有服务正在操作中，请稍后再试' });
    };

    //修改服务
    private readonly _alterService = () => {
        if (!this._isRoot) {
            if (this._loading.size === 0) {
                const serviceName = oVar(this._dataTree.data.name.value);
                const filePath = oVar(this._name);
                const autoRestart = oVar(this._dataTree.data.auto_restart.value);
                const reportError = oVar(this._dataTree.data.report_error.value);
                const errorTip = oArr(['', '']);

                showPopupWindow({
                    title: '修改服务',
                    content: (
                        <CreateService
                            isModify
                            name={serviceName}
                            filePath={filePath}
                            autoRestart={autoRestart}
                            reportError={reportError}
                            errorTip={errorTip}
                            subItems={this._root._dataTree.subItem as any} />
                    ),
                    ok: {
                        callback: async () => {
                            if (errorTip.every(item => item.length === 0)) {
                                try {
                                    const name = serviceName.value || filePath.value.split('/').pop() as string;
                                    this._loading.add('_alterService');
                                    await ServerApi.task.updateService(filePath.value, name, autoRestart.value, reportError.value);
                                    await this.refreshServiceList();
                                    closeWindowByPath(this._name, undefined, [WindowType.service]);
                                } catch (error) {
                                    showMessageBox({ icon: 'error', title: '更新服务失败', content: error.message });
                                } finally {
                                    this._loading.delete('_alterService');
                                }
                            }
                        }
                    }
                });
            } else
                showMessageBox({ icon: 'warning', title: '服务正在操作中，请稍后再试' });
        }
    };

    /**
     * 创建新服务
     */
    public async createService(): Promise<void> {
        const serviceName = oVar('');
        const filePath = oVar('');
        const autoRestart = oVar(true);
        const reportError = oVar(true);
        const errorTip = oArr(['', '']);

        showPopupWindow({
            title: '新建服务',
            content: (
                <CreateService
                    name={serviceName}
                    filePath={filePath}
                    autoRestart={autoRestart}
                    reportError={reportError}
                    errorTip={errorTip}
                    subItems={this._root._dataTree.subItem as any} />
            ),
            ok: {
                callback: async () => {
                    if (filePath.value.length > 0 && errorTip.every(item => item.length === 0)) {
                        try {
                            if (!serviceList.has(filePath.value)) {
                                const name = serviceName.value || filePath.value.split('/').pop() as string;
                                this._root._loading.add('_createService');
                                await ServerApi.task.createService(filePath.value, name, autoRestart.value, reportError.value);
                                await this.refreshServiceList();
                            }
                        } catch (error) {
                            showMessageBox({ icon: 'error', title: '创建服务失败', content: error.message });
                        } finally {
                            this._root._loading.delete('_createService');
                        }
                    }
                }
            }
        });
    }

    /**
     * 刷新服务列表
     */
    public async refreshServiceList(): Promise<void> {
        const tag = `_refreshServiceList_${Math.random()}`;

        try {
            this._root._loading.add(tag);

            if (await refreshTaskList() !== false) { //先刷新任务列表是因为依赖于任务列表
                const data = await ServerApi.task.getServicesList();

                //删除已经不再存在的服务
                for (const path of serviceList.keys()) {
                    if (data.every(item => item.path !== path))
                        serviceList.delete(path);
                }

                //更新或添加服务
                for (const item of data) {
                    if (serviceList.has(item.path)) {
                        const { name, auto_restart, report_error } = serviceList.get(item.path);
                        name.value = item.name;
                        auto_restart.value = item.auto_restart;
                        report_error.value = item.report_error;
                    } else {
                        serviceList.set(item.path, {
                            name: oVar(item.name),
                            auto_restart: oVar(item.auto_restart),
                            report_error: oVar(item.report_error)
                        });
                    }
                }
            }
        } catch (error) {
            showMessageBox({ icon: 'error', title: '刷新服务列表失败', content: error.message });
        } finally {
            this._root._loading.delete(tag);
        }
    }

    constructor(props: any, context: any) {
        super(props, context);

        if (this._isRoot) {
            const serviceAdd = (config: ServiceListValueType, path: string) => {
                (this._dataTree.subItem as any).set(path, { name: path, data: { ...config, status: taskList.get(path) } });
            }

            const serviceRemove = (config: ServiceListValueType, path: string) => {
                (this._dataTree.subItem as any).delete(path);
            }

            serviceList.on('add', serviceAdd);
            serviceList.on('remove', serviceRemove);

            this._unobserve.push(() => {
                serviceList.off('add', serviceAdd);
                serviceList.off('remove', serviceRemove);
            });

            serviceList.forEach(serviceAdd);

            this.refreshServiceList();
        } else {
            const setIconAndText = () => {
                this._fileIcon_url.value = `/static/res/img/buttons_icon/task-${this._dataTree.data.status.value}.svg`;
                this._fileIcon_displayContent.value = (
                    <>
                        ({this._dataTree.data.status.value === 'running' ? '正在运行' :
                            this._dataTree.data.status.value === 'stop' ? '停止' : '崩溃'})&nbsp;
                        {this._dataTree.data.name.value}
                        <span className={less.fileFullName}>{this._name}</span>
                    </>
                );
            };

            this._unobserve.push(watch([this._dataTree.data.status, this._dataTree.data.name], setIconAndText));
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
        const winArgs: ServiceWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: `(服务) ${this._dataTree.data.name.value}`,
            type: WindowType.service,
            args: { path: this._name }
        };

        openWindow(winArgs, e.altKey ? 'right' : undefined);
    }

    protected _onContextMenu(): (ContextMenuItemOptions | void | false)[][] {
        if (this._isRoot || this._loading.size > 0)
            return [];
        else {
            return [
                [
                    this._dataTree.data.status.value === 'running' && { name: '停止服务', callback: () => stopTask(this._name) },
                    this._dataTree.data.status.value === 'running' && { name: '重启服务', callback: () => restartTask(this._name) },
                    this._dataTree.data.status.value !== 'running' && { name: '启动服务', callback: () => startTask(this._name) },
                ],
                [
                    !this._isRoot && { name: '修改服务', callback: this._alterService },
                    !this._isRoot && { name: '删除服务', callback: this._deleteService }
                ]
            ];
        }
    }

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) { return parentProps }
    protected async _onOpenBranch(): Promise<false | void> { }
}