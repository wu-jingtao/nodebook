import * as React from 'react';
import { oSet, oVar, ObservableMap } from 'observable-variable';

import { showMessageBox } from '../../../../module/MessageBox/MessageBox';
import { showPopupWindow } from '../../../../module/PopupWindow/PopupWindow';
import { ServerApi } from '../../../ServerApi';
import { codeTemplate } from '../../../CodeTemplate';
import { BaseFileTree } from "../BaseFileTree/BaseFileTree";
import { EditableFileTreePropsType } from './EditableFileTreePropsType';
import { InputFileName } from './InputFileName/InputFileName';
import { UploadFile } from './UploadFile/UploadFile';

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
     * @param checkDescendants 是否连后代也要检查，默认false
     */
    private checkIsBusy(item: EditableFileTree<any> = this, checkDescendants?: boolean): boolean {
        if (checkDescendants && item._dataTree.subItem) {
            return [...EditableFileTree._processingItems.values()].every(fullNameString => {
                if (fullNameString.startsWith(this._fullNameString)) {
                    showMessageBox({
                        icon: 'warning',
                        title: `操作的项目正在处理中，请稍后再试`,
                        content: fullNameString,
                        autoClose: 3
                    });

                    return false;
                } else
                    return true;
            });
        } else {
            if (EditableFileTree._processingItems.has(item._fullNameString)) {
                showMessageBox({
                    icon: 'warning',
                    title: `操作的项目正在处理中，请稍后再试`,
                    content: item._fullNameString,
                    autoClose: 3
                });

                return false;
            } else
                return true;
        }
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
        if (items.every(item => this.checkIsBusy(item, true))) {
            EditableFileTree._copyItem = items;
            EditableFileTree._action = action;
        }
    };

    /**
     * 右键菜单粘贴。只有目录才有
     */
    private readonly _menu_paste = async () => {
        if (this._dataTree.subItem && EditableFileTree._copyItem.length > 0) {
            const items = EditableFileTree._copyItem;
            const action = EditableFileTree._action;

            //确保没有正在操作中的项目
            let checked = [this, ...items].every(item => this.checkIsBusy(item, true));

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
                    tasks.push({
                        from: item._fullNameString,
                        to: `${this._fullNameString}/${this.deduplicateFilename(this._dataTree.subItem, item._name)}`
                    });
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

    /**
     * 为重复的文件名后加上序号。没有重复就直接返回
     */
    private deduplicateFilename(subItem: ObservableMap<string, any>, filename: string): string {
        let name = filename;

        if (subItem.has(name)) {   //如果名称重复
            let index = 1;
            while (true) {
                if (!subItem.has(name = filename.replace(/(?![^\.]+)(\.?)/, `(${index++})$1`)))
                    break;
            }
        }

        return name;
    }

    //#endregion

    //#region 创建、删除、重命名

    /**
     * 创建目录。只有目录才有
     */
    private readonly _menu_createDirectory = () => {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const name = oVar('');

            showPopupWindow({
                content: <InputFileName name={name} subItems={this._dataTree.subItem} isDirectory />,
                ok: async () => {
                    try {
                        EditableFileTree._processingItems.add(this._fullNameString);
                        await ServerApi.file.createDirectory(`${this._fullNameString}/${name.value}`);
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
     * 创建文件。只有目录才有
     */
    private readonly _menu_createFile = () => {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const name = oVar('');

            showPopupWindow({
                content: <InputFileName name={name} subItems={this._dataTree.subItem} />,
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
     * 删除文件或目录。不允许删除根
     */
    private readonly _menu_delete = () => {
        if (!this._isRoot) {
            showMessageBox({
                icon: 'question', title: '删除确认',
                content: `确认要删除'${this._fullNameString}'吗?`,
                buttons: {
                    ok: async () => {
                        if (this.checkIsBusy(this, true)) {
                            try {
                                EditableFileTree._processingItems.add(this._fullNameString);
                                await this._onDelete();
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '创建文件失败', content: error.message });
                            } finally {
                                EditableFileTree._processingItems.delete(this._fullNameString);
                            }
                        }
                    },
                    cancel() { }
                }
            });
        }
    }

    /**
     * 重命名。根不允许重命名
     */
    private readonly _menu_rename = () => {
        if (!this._root && this.checkIsBusy(this, true)) {
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

    //#region 上传文件

    /**
     * 上传文件。只有目录才有
     */
    private readonly _menu_uploadFile = () => {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const file = oVar<File | undefined>(undefined);

            showPopupWindow({
                content: <UploadFile file={file} />,
                ok: () => file.value && this.prepareUploadFile(file.value)
            });
        }
    };

    /**
     * 准本上传文件的操作
     */
    private prepareUploadFile(file: File) {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const progress = oVar(0);
            const filename = `${this._fullNameString}/${this.deduplicateFilename(this._dataTree.subItem, file.name)}`;
            ServerApi.file.uploadFile(file, filename, progress);

            showMessageBox({
                icon: 'file',
                title: '上传文件',
                content: filename,
                progress,
                autoClose: 3
            });
        }
    }

    //#endregion

    //#region 压缩、解压

    /**
     * 压缩文件或目录。不允许压缩根
     */
    private readonly _menu_zip = () => {
        if (!this._isRoot && this.checkIsBusy(this, true)) {
            const name = oVar('');

            showPopupWindow({
                content: <InputFileName name={name} subItems={(this._parent as any)._dataTree.subItem} />,
                ok: async () => {
                    try {
                        EditableFileTree._processingItems.add(this._fullNameString);
                        await ServerApi.file.zipData(this._fullNameString, `${(this._parent as any)._fullNameString}/${name.value}`);
                    } catch (error) {
                        showMessageBox({ icon: 'error', title: '压缩文件失败', content: error.message });
                    } finally {
                        EditableFileTree._processingItems.delete(this._fullNameString);
                    }
                }
            });
        }
    };

    /**
     * 解压
     */
    private readonly _menu_unzip = async () => {
        if (this._dataTree.subItem === undefined && this.checkIsBusy() && (this._parent as any).checkIsBusy()) {
            try {
                EditableFileTree._processingItems.add(this._fullNameString);
                EditableFileTree._processingItems.add((this._parent as any)._fullNameString);

                const unzipName = this.deduplicateFilename(
                    (this._parent as any)._dataTree.subItem,
                    (this._name.match(/[^\.]+/) || ['解压的文件'])[0]
                );

                await ServerApi.file.unzipData(
                    this._fullNameString,
                    `${(this._parent as any)._fullNameString}/${unzipName}`
                );
            } catch (error) {
                showMessageBox({ icon: 'error', title: '解压文件失败', content: error.message });
            } finally {
                EditableFileTree._processingItems.delete(this._fullNameString);
                EditableFileTree._processingItems.delete((this._parent as any)._fullNameString);
            }
        }
    };

    //#endregion

    //#region 拖拽

    private readonly _onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'copyMove';

        if (!this._focusedItem.has(this)) {
            this._focusedItem.clear();
            this._focusedItem.add(this);
        }

        const items = [...this._focusedItem.values()];
        if (items.every(item => this.checkIsBusy(item, true))) {
            EditableFileTree._copyItem = items;
        }

        e.dataTransfer.setDragImage(document.createElement('img'), 0, 0);
    };

    private readonly _onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        EditableFileTree._copyItem = [];
    };

    private readonly _onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (this._dataTree.subItem) {
            e.preventDefault();
            e.stopPropagation();
            this._hoveredItem.value = this;
        }
    };

    private readonly _onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (this._dataTree.subItem) {
            e.stopPropagation();

            if (e.dataTransfer.files.length > 0) {
                this.prepareUploadFile(e.dataTransfer.files[0]);
            } else {
                EditableFileTree._action = e.ctrlKey ? 'copy' : 'cut';
                this._menu_paste();
            }
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
        return {
            ...parentProps,

        };
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