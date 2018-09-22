import * as React from 'react';
import { oSet, oVar, ObservableMap } from 'observable-variable';
import clipboard = require('copy-text-to-clipboard');

import { showMessageBox } from '../../../../module/MessageBox/MessageBox';
import { showPopupWindow } from '../../../../module/PopupWindow/PopupWindow';
import { ContextMenuItemOptions } from '../../../../module/ContextMenu/ContextMenuOptions';
import { ServerApi } from '../../../ServerApi';
import { codeTemplate } from '../../../CodeTemplate';
import { BaseFileTree } from "../BaseFileTree/BaseFileTree";
import { EditableFileTreePropsType } from './EditableFileTreePropsType';
import { InputFileName } from './InputFileName/InputFileName';
import { UploadFile } from './UploadFile/UploadFile';
import { DeleteFiles } from './DeleteFiles/DeleteFiles';

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
    protected readonly _menu_copyCut = (action: 'copy' | 'cut') => {
        if (!this._focusedItem.has(this)) {
            this._focusedItem.clear();
            this._focusedItem.add(this);
        }

        const items = [...this._focusedItem.values()];
        if (items.every(item => !item._isRoot && this.checkIsBusy(item, true))) {
            EditableFileTree._copyItem = items;
            EditableFileTree._action = action;
        } else {
            EditableFileTree._copyItem = [];
            EditableFileTree._action = undefined;
        }
    };

    /**
     * 右键菜单粘贴。只有目录才有
     */
    protected readonly _menu_paste = async () => {
        if (this._dataTree.subItem && EditableFileTree._copyItem.length > 0) {
            const items = EditableFileTree._copyItem;
            const action = EditableFileTree._action;

            EditableFileTree._copyItem = [];
            EditableFileTree._action = undefined;

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
                const tasks: { from: string, to: string }[] = [];

                for (const item of items) {
                    //筛除没有发生移动的文件
                    if (action === 'cut' && item._fullNameString === `${this._fullNameString}/${item._name}`)
                        continue;

                    tasks.push({
                        from: item._fullNameString,
                        to: `${this._fullNameString}/${this.deduplicateFilename(this._dataTree.subItem, item._name)}`
                    });
                }

                if (tasks.length > 0) {
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

                        //刷新文件夹
                        const refreshItems = new Set();
                        if (action === 'cut') items.forEach(item => item._parent && refreshItems.add(item._parent));
                        refreshItems.add(this);
                        refreshItems.forEach(item => item._menu_refresh());
                    }
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
    protected readonly _menu_createDirectory = () => {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const name = oVar('');
            const errorTip = oVar('');

            showPopupWindow({
                title: '新建文件夹',
                content: <InputFileName name={name} errorTip={errorTip} subItems={this._dataTree.subItem} isDirectory />,
                ok: {
                    callback: async () => {
                        if (!errorTip.value) {
                            try {
                                EditableFileTree._processingItems.add(this._fullNameString);
                                await ServerApi.file.createDirectory(`${this._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '创建文件夹失败', content: error.message });
                            } finally {
                                EditableFileTree._processingItems.delete(this._fullNameString);
                                this._menu_refresh();
                            }
                        }
                    }
                }
            });
        }
    };

    /**
     * 创建文件。只有目录才有
     */
    protected readonly _menu_createFile = () => {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const name = oVar('');
            const errorTip = oVar('');

            showPopupWindow({
                title: '新建文件',
                content: <InputFileName name={name} errorTip={errorTip} subItems={this._dataTree.subItem} />,
                ok: {
                    callback: async () => {
                        if (!errorTip.value) {
                            try {
                                EditableFileTree._processingItems.add(this._fullNameString);
                                const data = new Blob([codeTemplate(name.value)], { type: 'text/plain' });
                                await ServerApi.file.uploadFile(data, `${this._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '创建文件失败', content: error.message });
                            } finally {
                                EditableFileTree._processingItems.delete(this._fullNameString);
                                this._menu_refresh();
                            }
                        }
                    }
                }
            });
        }
    };

    /**
     * 删除文件或目录。不允许删除根
     */
    protected readonly _menu_delete = () => {
        if (!this._focusedItem.has(this)) {
            this._focusedItem.clear();
            this._focusedItem.add(this);
        }

        const items = [...this._focusedItem.values()];
        if (items.every(item => !item._isRoot && this.checkIsBusy(item, true))) {
            showPopupWindow({
                title: `确认要删除的文件`,
                content: <DeleteFiles items={items.map(item => ({
                    name: item._name,
                    fullName: item._fullNameString,
                    isDirectory: item._dataTree.subItem !== undefined
                }))} />,
                ok: {
                    callback: async () => {
                        try {
                            items.forEach(item => EditableFileTree._processingItems.add(item._fullNameString));
                            await Promise.all(items.map(item => item._onDelete()));
                        } catch (error) {
                            showMessageBox({ icon: 'error', title: '删除失败', content: error.message });
                        } finally {
                            items.forEach(item => EditableFileTree._processingItems.delete(item._fullNameString));
                            (new Set(items.map(item => item._parent))).forEach(item => item && item._menu_refresh());
                        }
                    }
                }
            });
        }
    }

    /**
     * 重命名。根不允许重命名
     */
    protected readonly _menu_rename = () => {
        if (!this._isRoot && this.checkIsBusy(this, true)) {
            const name = oVar(this._name);
            const errorTip = oVar('');

            showPopupWindow({
                title: '重命名',
                content: <InputFileName name={name} errorTip={errorTip} subItems={(this._parent as any)._dataTree.subItem}
                    isDirectory={this._dataTree.subItem !== undefined} isRename />,
                ok: {
                    callback: async () => {
                        if (!errorTip.value && this._name !== name.value) {
                            try {
                                EditableFileTree._processingItems.add(this._fullNameString);
                                await ServerApi.file.move(this._fullNameString, `${(this._parent as any)._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '重命名失败', content: error.message });
                            } finally {
                                EditableFileTree._processingItems.delete(this._fullNameString);
                                (this._parent as any)._menu_refresh();
                            }
                        }
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
    protected readonly _menu_uploadFile = () => {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const file = oVar<File | undefined>(undefined);

            showPopupWindow({
                title: '上传文件',
                content: <UploadFile file={file} />,
                ok: {
                    callback: () => file.value && this.prepareUploadFile(file.value)
                }
            });
        }
    };

    /**
     * 准本上传文件的操作
     */
    private async prepareUploadFile(file: File) {
        if (this._dataTree.subItem && this.checkIsBusy()) {
            const progress = oVar(0);
            const filename = `${this._fullNameString}/${this.deduplicateFilename(this._dataTree.subItem, file.name)}`;
            const promise = ServerApi.file.uploadFile(file, filename, progress);

            try {
                showMessageBox({
                    icon: 'file',
                    title: '上传文件',
                    content: filename,
                    progress,
                    autoClose: 3,
                    buttons: {
                        cancel: {
                            name: '取消上传',
                            callback: () => {
                                promise.abort();
                            }
                        }
                    }
                });

                await promise;
            } catch (error) {
                showMessageBox({
                    icon: 'error',
                    title: '上传文件失败',
                    content: `文件：${filename}。${error.message}`
                });
            } finally {
                this._menu_refresh();
            }
        }
    }

    //#endregion

    //#region 压缩、解压

    /**
     * 压缩文件或目录。不允许压缩根
     */
    protected readonly _menu_zip = () => {
        if (!this._isRoot && this.checkIsBusy(this, true)) {
            const name = oVar(`${this._name}.zip`);
            const errorTip = oVar('');

            showPopupWindow({
                title: '新建压缩文件名',
                content: <InputFileName name={name} errorTip={errorTip}
                    subItems={(this._parent as any)._dataTree.subItem}
                    extraValidation={value => value.endsWith('.zip') ? '' : "压缩文件名必须以'.zip'结尾"} />,
                ok: {
                    callback: async () => {
                        if (!errorTip.value) {
                            try {
                                EditableFileTree._processingItems.add(this._fullNameString);
                                await ServerApi.file.zipData(this._fullNameString, `${(this._parent as any)._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '压缩文件失败', content: error.message });
                            } finally {
                                EditableFileTree._processingItems.delete(this._fullNameString);
                                (this._parent as any)._menu_refresh();
                            }
                        }
                    }
                }
            });
        }
    };

    /**
     * 解压
     */
    protected readonly _menu_unzip = async () => {
        if (this._dataTree.subItem === undefined &&
            this._name.endsWith('.zip') &&
            this.checkIsBusy() &&
            (this._parent as any).checkIsBusy()) {
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
                (this._parent as any)._menu_refresh();
            }
        }
    };

    //#endregion

    //#region 复制文件路径

    /**
     * 复制当前文件的绝对路径
     */
    protected readonly _menu_copyPath = () => {
        if (!clipboard(this._fullNameString)) {
            showMessageBox({ icon: 'message', title: '复制绝对路径失败，请手动复制', content: this._fullNameString, autoClose: 0 });
        }
    };

    //#endregion

    //#region 下载

    /**
     * 下载文件
     */
    protected readonly _menu_download = () => {
        if (this._dataTree.subItem === undefined && this.checkIsBusy())
            window.open(`/file/api/readFile?path=${this._fullNameString}`);
    };

    /**
     * 下载文件并压缩
     */
    protected readonly _menu_zip_download = () => {
        if (this.checkIsBusy(this, true))
            window.open(`/file/api/zipDownloadData?path=${this._fullNameString}`);
    };

    //#endregion

    //#region 刷新文件夹

    private readonly _menu_refresh = async () => {
        try {
            await this._refreshFolder();
        } catch (error) {
            showMessageBox({
                icon: 'error',
                title: `刷新文件夹失败`,
                content: error.message
            });
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
        if (items.every(item => !item._isRoot && this.checkIsBusy(item, true)))
            EditableFileTree._copyItem = items;
        else
            EditableFileTree._copyItem = [];

        e.dataTransfer.setDragImage(document.createElement('img'), 0, 0);
        e.dataTransfer.setData('EditableFileTree_drag', this._root._name);
    };

    private readonly _onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();

        EditableFileTree._copyItem = [];
    };

    /**
     * 只有目录才需要
     */
    private readonly _onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (this._dataTree.subItem) {
            //确保拖拽的数据类型
            if (e.dataTransfer.types.includes('EditableFileTree_drag') ||
                !this._root.props.noUpload && e.dataTransfer.types.includes('Files')) {
                e.stopPropagation();
                e.preventDefault();

                this._hoveredItem.value = this;
            }
        }
    };

    /**
     * 只有目录才需要
     */
    private readonly _onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (this._dataTree.subItem) {
            e.stopPropagation();
            e.preventDefault();

            if (!this._root.props.noUpload && e.dataTransfer.files.length > 0) {
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

    //#region 公开的方法

    /**
     * 在焦点目录下创建文件
     */
    public createFile() {
        let target = [...this._focusedItem.values()].pop() || this._root;
        target = target._dataTree.subItem ? target : target._parent as any;
        target._menu_createFile();
    }

    /**
     * 在焦点目录下创建文件夹
     */
    public createDirectory() {
        let target = [...this._focusedItem.values()].pop() || this._root;
        target = target._dataTree.subItem ? target : target._parent as any;
        target._menu_createDirectory();
    }

    /**
     * 上传文件到根
     */
    public uploadFile(file: File) {
        this.prepareUploadFile(file);
    }

    //#endregion

    protected _onContextMenu(): (ContextMenuItemOptions | void | false)[][] {
        return [
            [   //刷新
                this._dataTree.subItem === undefined ? undefined : { name: '刷新', callback: this._menu_refresh },
            ],
            [   //复制、剪切、粘贴
                this._root.props.noCopyCut || this._isRoot ? undefined : { name: '复制', callback: this._menu_copyCut.bind(undefined, 'copy') },
                this._root.props.noCopyCut || this._isRoot ? undefined : { name: '剪切', callback: this._menu_copyCut.bind(undefined, 'cut') },
                this._root.props.noPaste || this._dataTree.subItem === undefined || EditableFileTree._copyItem.length === 0
                    ? undefined : { name: '粘贴', callback: this._menu_paste },
            ],
            [   //复制文件路径
                { name: '复制绝对路径', callback: this._menu_copyPath },
            ],
            [   //创建
                this._root.props.noCreate || this._dataTree.subItem === undefined ? undefined : { name: '新建文件', callback: this._menu_createFile },
                this._root.props.noCreate || this._dataTree.subItem === undefined ? undefined : { name: '新建文件夹', callback: this._menu_createDirectory },
            ],
            [   //删除
                this._root.props.noDelete || this._isRoot ? undefined : { name: '删除', callback: this._menu_delete },
            ],
            [   //重命名
                this._root.props.noRename || this._isRoot ? undefined : { name: '重命名', callback: this._menu_rename },
            ],
            [   //上传文件
                this._root.props.noUpload || this._dataTree.subItem === undefined ? undefined : { name: '上传文件', callback: this._menu_uploadFile }
            ],
            [   //下载
                this._root.props.noDownload || this._dataTree.subItem !== undefined ? undefined : { name: '下载文件', callback: this._menu_download },
                this._root.props.noDownload || this._name.endsWith('.zip') ? undefined : { name: '压缩下载', callback: this._menu_zip_download },
            ],
            [   //压缩、解压
                this._root.props.noZip || this._isRoot ? undefined : { name: '压缩成zip文件', callback: this._menu_zip },
                this._root.props.noZip || !this._name.endsWith('.zip') ? undefined : { name: '解压zip文件', callback: this._menu_unzip },
            ],
        ];
    }

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>)
        : React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
        return {
            ...parentProps,
            draggable: this._root.props.noCopyCut || this._isRoot ? false : true,
            onDragStart: this._root.props.noCopyCut || this._isRoot ? undefined : this._onDragStart,
            onDragEnd: this._root.props.noCopyCut || this._isRoot ? undefined : this._onDragEnd,
            onDragOver: this._root.props.noPaste || this._dataTree.subItem === undefined ? undefined : this._onDragOver,
            onDrop: this._root.props.noPaste || this._dataTree.subItem === undefined ? undefined : this._onDrop,
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