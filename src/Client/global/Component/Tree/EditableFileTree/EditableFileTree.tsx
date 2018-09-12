import * as React from 'react';
import { oSet, oVar } from 'observable-variable';

import { showMessageBox } from '../../../../module/MessageBox/MessageBox';
import { showPopupWindow } from '../../../../module/PopupWindow/PopupWindow';
import { ServerApi } from '../../../ServerApi';
import { codeTemplate } from '../../../CodeTemplate';
import { BaseFileTree } from "../BaseFileTree/BaseFileTree";
import { EditableFileTreePropsType } from './EditableFileTreePropsType';
import { InputFileName } from './InputFileName/InputFileName';

/**
 * 可编辑文件数
 */
export abstract class EditableFileTree<P extends EditableFileTreePropsType> extends BaseFileTree<P> {

    //#region 复制项目

    /**
     * 临时保存要复制的项目对象，在执行粘贴后就应当立刻将其清空
     */
    private static _copyItem: EditableFileTree<any>[] = [];

    /**
     * 判断是复制还是剪切
     */
    private static _action: 'copy' | 'cut' | undefined;

    //#endregion

    //#region 正在处理中的项目

    /**
     * 正在处理中的项目，value是_fullNameString
     */
    private static _processingItems = oSet<string>([]);

    private readonly _watch_processingItems_add = (value: string) => {
        if (value === this._fullNameString)
            this._loading.add('_onProcessing');
    };

    private readonly _watch_processingItems_remove = (value: string) => {
        if (value === this._fullNameString)
            this._loading.delete('_onProcessing');
    };

    /**
     * 检查要操作的项目是否正在处理中。返回true表示并未在处理中
     */
    private checkIsBusy(fullNameString: string = this._fullNameString): boolean {
        if (EditableFileTree._processingItems.has(fullNameString)) {
            showMessageBox({ icon: 'warning', title: '操作的文件正在处理中', content: fullNameString, autoClose: 3 });
            return false;
        } else
            return true;
    }

    //#endregion

    //#region 复制、剪切、粘贴

    /**
     * 右键菜单复制或剪切
     */
    private readonly _menu_copyCut = (action: 'copy' | 'cut') => {
        if (!this._focusedItem.has(this)) {
            this._focusedItem.clear();
            this._focusedItem.add(this);
        }

        const items = [...this._focusedItem.values()];
        if (items.every(item => this.checkIsBusy(item._fullNameString))) {
            EditableFileTree._copyItem = items;
            EditableFileTree._action = action;
        }
    };

    /**
     * 右键菜单粘贴
     */
    private readonly _menu_paste = async () => {
        if (this._dataTree.subItem) {
            const items = EditableFileTree._copyItem;
            const action = EditableFileTree._action;

            //确保没有正在操作中的项目
            let checked = [this, ...items].every((item: EditableFileTree<any>) => this.checkIsBusy(item._fullNameString));

            //检查是否有文件夹，复制或剪切自己到自己内部
            checked = checked && items.every(item => {
                if (item._dataTree.subItem) {
                    const result = this._fullNameString.startsWith(item._fullNameString);

                    if (result)
                        showMessageBox({
                            icon: 'warning',
                            title: `递归${action === 'copy' ? '复制' : '剪切'}`,
                            content: `文件夹'${item._fullNameString}'不能${action === 'copy' ? '复制' : '剪切'}自己到自己内部`
                        });

                    return !result;
                } else
                    return true;
            });

            if (checked) {
                EditableFileTree._copyItem = [];
                EditableFileTree._action = undefined;

                const tasks: { from: string, to: string }[] = [];
                for (const item of items) {
                    let name = item._name;

                    if (this._dataTree.subItem.has(name)) {   //如果名称重复
                        let index = 1;
                        while (true) {
                            if (!this._dataTree.subItem.has(name = item._name.replace(/(?![^\.]+)(\.?)/, `(${index++})$1`)))
                                break;
                        }
                    }

                    tasks.push({ from: item._fullNameString, to: `${this._fullNameString}/${name}` });
                }

                try {
                    //标记正在操作
                    [this, ...items].forEach((item: EditableFileTree<any>) => EditableFileTree._processingItems.add(item._fullNameString));

                    if (action === 'copy')
                        await Promise.all(tasks.map(item => ServerApi.file.copy(item.from, item.to)));
                    else
                        await Promise.all(tasks.map(item => ServerApi.file.move(item.from, item.to)));
                } catch (error) {
                    showMessageBox({
                        icon: 'error',
                        title: `${action === 'copy' ? '复制' : '剪切'}失败`,
                        content: error.message
                    });
                } finally {
                    [this, ...items].forEach((item: EditableFileTree<any>) => EditableFileTree._processingItems.delete(item._fullNameString));
                }
            }
        }
    };

    //#endregion

    //#region 创建、删除、重命名

    /**
     * 创建目录
     */
    private readonly _menu_createDirectory = () => {
        if (this.checkIsBusy()) {
            const name = oVar('');

            showPopupWindow({
                content: <InputFileName name={name} subItems={this._dataTree.subItem as any} isDirectory />,
                ok: async () => {
                    try {
                        EditableFileTree._processingItems.add(this._fullNameString);
                        await ServerApi.file.createDirectory(name.value);
                    } catch (error) {
                        showMessageBox({ icon: 'error', title: '创建文件夹失败', content: error.message });
                    } finally {
                        EditableFileTree._processingItems.delete(this._fullNameString);
                    }
                }
            });
        }
    };

    /**
     * 创建文件
     */
    private readonly _menu_createFile = () => {
        if (this.checkIsBusy()) {
            const name = oVar('');

            showPopupWindow({
                content: <InputFileName name={name} subItems={this._dataTree.subItem as any} />,
                ok: async () => {
                    try {
                        EditableFileTree._processingItems.add(this._fullNameString);
                        const data = new Blob([codeTemplate(name.value)], { type: 'text/plain' });
                        await ServerApi.file.uploadFile(data, `${this._fullNameString}/${name.value}`);
                    } catch (error) {
                        showMessageBox({ icon: 'error', title: '创建文件失败', content: error.message });
                    } finally {
                        EditableFileTree._processingItems.delete(this._fullNameString);
                    }
                }
            });
        }
    };

    /**
     * 删除文件或目录
     */
    private readonly _menu_delete = () => {
        if (this.checkIsBusy()) {
            showMessageBox({
                icon: 'question', title: '删除确认',
                content: `确认要删除'${this._fullNameString}'吗?`,
                buttons: {
                    ok: async () => {
                        try {
                            EditableFileTree._processingItems.add(this._fullNameString);
                            await this._onDelete();
                        } catch (error) {
                            showMessageBox({ icon: 'error', title: '创建文件失败', content: error.message });
                        } finally {
                            EditableFileTree._processingItems.delete(this._fullNameString);
                        }
                    },
                    cancel() { }
                }
            });
        }
    }

    /**
     * 重命名
     */
    private readonly _menu_rename = () => {
        if (this.checkIsBusy()) {
            const name = oVar(this._name);

            showPopupWindow({
                content: <InputFileName name={name} subItems={(this._parent as any)._dataTree.subItem}
                    isDirectory={this._dataTree.subItem !== undefined} isRename />,
                ok: async () => {
                    try {
                        EditableFileTree._processingItems.add(this._fullNameString);
                        await ServerApi.file.move(this._fullNameString, `${(this._parent as any)._fullNameString}/${name.value}`);
                    } catch (error) {
                        showMessageBox({ icon: 'error', title: '重命名失败', content: error.message });
                    } finally {
                        EditableFileTree._processingItems.delete(this._fullNameString);
                    }
                }
            });
        }
    };

    //#endregion

    //#region 继承方法

    /**
     * 删除文件或目录
     */
    protected abstract _onDelete(): Promise<void>;

    //#endregion

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
        return parentProps;
    }

    constructor(props: any, context: any) {
        super(props, context);

        //判断当前的节点是否正在操作中
        if (EditableFileTree._processingItems.has(this._fullNameString))
            this._watch_processingItems_add(this._fullNameString);

        EditableFileTree._processingItems.on('add', this._watch_processingItems_add);
        EditableFileTree._processingItems.on('remove', this._watch_processingItems_remove);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if (this._isRoot) {
            EditableFileTree._copyItem = [];
            EditableFileTree._action = undefined;
        }

        EditableFileTree._processingItems.off('add', this._watch_processingItems_add);
        EditableFileTree._processingItems.off('remove', this._watch_processingItems_remove);
    }
}