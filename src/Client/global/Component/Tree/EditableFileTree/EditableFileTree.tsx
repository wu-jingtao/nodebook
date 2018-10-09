import * as React from 'react';
import * as $ from 'jquery';
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

const less = require('./EditableFileTree.less');

//拖拽时在鼠标上显示的文字
const dragText = $(`<i class="${less.EditableFileTree_dragText}"></i>`).appendTo(document.body);

/**
 * 正在处理中的文件或文件夹，value是_fullNameString
 */
export const processingItems = oSet<string>([]);

/**
 * 检查文件或文件夹是否正在处理中。返回true表示未在处理中
 * @param path 绝对路径
 * @param isDirectory 是否是目录
 */
export function checkIsBusy(path: string, isDirectory?: boolean): boolean {
    for (const fullNameString of processingItems.value) {
        let result = true;

        if (path.startsWith(fullNameString))    //检查父级是否正在处理中
            result = false;
        else if (isDirectory && fullNameString.startsWith(path))    //检查子级是否正在处理中
            result = false;

        if (!result) {
            showMessageBox({ icon: 'warning', title: `操作的文件或目录正在处理中，请稍后再试`, content: fullNameString, autoClose: 3 });
            return result;
        }
    }

    return true;
}

/**
 * 可编辑文件数
 */
export abstract class EditableFileTree<P extends EditableFileTreePropsType> extends BaseFileTree<P> {

    //#region 复制项目

    /**
     * 临时保存要复制的项目对象，在执行粘贴后就应当立刻将其清空
     */
    protected static _copyItem: EditableFileTree<any>[] = [];

    /**
     * 判断是复制还是剪切
     */
    protected static _action: 'copy' | 'cut' | undefined;

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
        if (items.every(item => !item._isRoot && checkIsBusy(item._fullNameString, item._isBranch))) {
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
    protected readonly _menu_paste = () => {
        const items = EditableFileTree._copyItem;
        const action = EditableFileTree._action;

        EditableFileTree._copyItem = [];
        EditableFileTree._action = undefined;

        this._preparePaste(items, action || 'cut');
    };

    /**
     * 粘贴操作
     */
    protected async _preparePaste(items: EditableFileTree<any>[], action: 'copy' | 'cut'): Promise<void> {
        if (this._dataTree.subItem && items.length > 0) {
            //确保没有正在操作中的项目
            let checked = [this, ...items].every((item: EditableFileTree<any>) => checkIsBusy(item._fullNameString, item._isBranch));

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
                const tasks: { from: EditableFileTree<any>, to: string }[] = [];

                for (const item of items) {
                    //筛除没有发生移动的文件
                    if (action === 'cut' && item._fullNameString === `${this._fullNameString}/${item._name}`)
                        continue;

                    tasks.push({
                        from: item,
                        to: `${this._fullNameString}/${this._deduplicateFilename(this._dataTree.subItem, item._name)}`
                    });
                }

                if (tasks.length > 0) {
                    try {
                        //标记正在操作
                        [this, ...items].forEach((item: EditableFileTree<any>) => processingItems.add(item._fullNameString));

                        if (action === 'copy')
                            await Promise.all(tasks.map(item => ServerApi.file.copy(item.from._fullNameString, item.to)));
                        else
                            await Promise.all(tasks.map(item => item.from._onCut(item.to)));
                    } catch (error) {
                        showMessageBox({
                            icon: 'error',
                            title: `${action === 'copy' ? '复制' : '剪切'}失败`,
                            content: error.message
                        });
                    } finally {
                        [this, ...items].forEach((item: EditableFileTree<any>) => processingItems.delete(item._fullNameString));

                        //删除已经不在的焦点项
                        if (action === 'cut') items.forEach(item => item._focusedItem.delete(item));

                        //刷新文件夹
                        const refreshItems = new Set<EditableFileTree<any>>();
                        if (action === 'cut') items.forEach(item => item._parent && refreshItems.add(item._parent));
                        refreshItems.add(this);
                        refreshItems.forEach(item => item._menu_refresh());
                    }
                }
            }
        }
    }

    /**
     * 为重复的文件名后加上序号。没有重复就直接返回
     */
    protected _deduplicateFilename(subItem: ObservableMap<string, any>, filename: string): string {
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
        if (this._dataTree.subItem && checkIsBusy(this._fullNameString)) {
            const name = oVar('');
            const errorTip = oVar('');

            showPopupWindow({
                title: '新建文件夹',
                content: <InputFileName name={name} errorTip={errorTip} subItems={this._dataTree.subItem} isDirectory />,
                ok: {
                    callback: async () => {
                        if (!errorTip.value) {
                            try {
                                processingItems.add(this._fullNameString);
                                await ServerApi.file.createDirectory(`${this._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '创建文件夹失败', content: error.message });
                            } finally {
                                processingItems.delete(this._fullNameString);
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
        if (this._dataTree.subItem && checkIsBusy(this._fullNameString)) {
            const name = oVar('');
            const errorTip = oVar('');

            showPopupWindow({
                title: '新建文件',
                content: <InputFileName name={name} errorTip={errorTip} subItems={this._dataTree.subItem} />,
                ok: {
                    callback: async () => {
                        if (!errorTip.value) {
                            try {
                                processingItems.add(this._fullNameString);
                                const data = new Blob([codeTemplate(name.value)], { type: 'text/plain' });
                                await ServerApi.file.uploadFile(data, `${this._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '创建文件失败', content: error.message });
                            } finally {
                                processingItems.delete(this._fullNameString);
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

        this._prepareDelete([...this._focusedItem.values()]);
    }

    /**
     * 重命名。根不允许重命名
     */
    protected readonly _menu_rename = () => {
        if (!this._isRoot && checkIsBusy(this._fullNameString, this._isBranch)) {
            const name = oVar(this._name);
            const errorTip = oVar('');

            showPopupWindow({
                title: '重命名',
                content: <InputFileName name={name} errorTip={errorTip} subItems={(this._parent as any)._dataTree.subItem}
                    isDirectory={this._isBranch} isRename />,
                ok: {
                    callback: async () => {
                        if (!errorTip.value && this._name !== name.value) {
                            try {
                                processingItems.add(this._fullNameString);
                                await this._onCut(`${(this._parent as any)._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '重命名失败', content: error.message });
                            } finally {
                                processingItems.delete(this._fullNameString);
                                (this._parent as any)._menu_refresh();
                            }
                        }
                    }
                }
            });
        }
    };

    /**
     * 准备删除文件
     */
    protected async _prepareDelete(items: EditableFileTree<any>[]): Promise<void> {
        if (items.length > 0 && items.every(item => !item._isRoot && checkIsBusy(item._fullNameString, item._isBranch))) {
            showPopupWindow({
                title: `确认要删除的文件`,
                content: <DeleteFiles items={items.map(item => ({
                    name: item._name,
                    fullName: item._fullNameString,
                    isDirectory: item._isBranch
                }))} />,
                ok: {
                    callback: async () => {
                        try {
                            items.forEach(item => processingItems.add(item._fullNameString));
                            await Promise.all(items.map(item => item._onDelete()));
                        } catch (error) {
                            showMessageBox({ icon: 'error', title: '删除失败', content: error.message });
                        } finally {
                            items.forEach(item => {
                                processingItems.delete(item._fullNameString);
                                item._focusedItem.delete(item);
                            });

                            (new Set(items.map(item => item._parent))).forEach(item => item && item._menu_refresh());
                        }
                    }
                }
            });
        }
    }

    //#endregion

    //#region 上传文件

    /**
     * 上传文件。只有目录才有
     */
    protected readonly _menu_uploadFile = () => {
        if (this._dataTree.subItem && checkIsBusy(this._fullNameString)) {
            const file = oVar<File | undefined>(undefined);

            showPopupWindow({
                title: '上传文件',
                content: <UploadFile file={file} />,
                ok: {
                    callback: () => file.value && this._prepareUploadFile(file.value)
                }
            });
        }
    };

    /**
     * 准本上传文件的操作
     */
    protected async _prepareUploadFile(file: File) {
        if (this._dataTree.subItem && checkIsBusy(this._fullNameString)) {
            const progress = oVar(0);
            const filename = `${this._fullNameString}/${this._deduplicateFilename(this._dataTree.subItem, file.name)}`;
            const promise = ServerApi.file.uploadFile(file, filename, progress);

            try {
                showMessageBox({
                    icon: 'file',
                    title: '上传文件',
                    fileName: filename,
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
        if (!this._isRoot && checkIsBusy(this._fullNameString, this._isBranch)) {
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
                                processingItems.add(this._fullNameString);
                                await ServerApi.file.zipData(this._fullNameString, `${(this._parent as any)._fullNameString}/${name.value}`);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '压缩文件失败', content: error.message });
                            } finally {
                                processingItems.delete(this._fullNameString);
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
        if (!this._isBranch && this._name.endsWith('.zip') &&
            checkIsBusy(this._fullNameString) && checkIsBusy((this._parent as any)._fullNameString)) {
            try {
                processingItems.add(this._fullNameString);
                processingItems.add((this._parent as any)._fullNameString);

                const unzipName = this._deduplicateFilename(
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
                processingItems.delete(this._fullNameString);
                processingItems.delete((this._parent as any)._fullNameString);
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
        if (!this._isBranch && checkIsBusy(this._fullNameString))
            window.open(`/file/api/readFile?path=${this._fullNameString}`);
    };

    /**
     * 下载文件并压缩
     */
    protected readonly _menu_zip_download = () => {
        if (checkIsBusy(this._fullNameString, this._isBranch))
            window.open(`/file/api/zipDownloadData?path=${this._fullNameString}`);
    };

    //#endregion

    //#region 刷新文件夹

    protected readonly _menu_refresh = async () => {
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
        if (items.every(item => !item._isRoot && checkIsBusy(this._fullNameString, this._isBranch)))
            EditableFileTree._copyItem = items;
        else
            EditableFileTree._copyItem = [];

        //设置拖拽鼠标图标
        if (EditableFileTree._copyItem.length > 0)
            dragText.text(EditableFileTree._copyItem.map(item => item._name).join('，'));
        else
            dragText.text('禁止拖拽');

        e.dataTransfer.setDragImage(dragText[0], -20, 0);

        //配置数据
        e.dataTransfer.setData('editable_file_tree_drag', this._root._name);
        e.dataTransfer.setData('text/plain', EditableFileTree._copyItem.map(item => item._fullNameString).join('\n'));
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
            if (e.dataTransfer.types.includes('editable_file_tree_drag') ||
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
                [...e.dataTransfer.files].forEach(file => this._prepareUploadFile(file));
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

    /**
     * 剪切(重命名)文件或目录
     */
    protected _onCut(to: string): Promise<void> {
        return ServerApi.file.move(this._fullNameString, to);
    }

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

    //#endregion

    protected _onContextMenu(): (ContextMenuItemOptions | void | false)[][] {
        return [
            [   //刷新
                this._isBranch ? { name: '刷新', callback: this._menu_refresh } : undefined,
            ],
            [   //复制、剪切、粘贴
                this._root.props.noCopyCut || this._isRoot ? undefined : { name: '复制', callback: this._menu_copyCut.bind(undefined, 'copy') },
                this._root.props.noCopyCut || this._isRoot ? undefined : { name: '剪切', callback: this._menu_copyCut.bind(undefined, 'cut') },
                this._root.props.noPaste || !this._isBranch || EditableFileTree._copyItem.length === 0
                    ? undefined : { name: '粘贴', callback: this._menu_paste },
            ],
            [   //复制文件路径
                { name: '复制绝对路径', callback: this._menu_copyPath },
            ],
            [   //创建
                this._root.props.noCreate || !this._isBranch ? undefined : { name: '新建文件', callback: this._menu_createFile },
                this._root.props.noCreate || !this._isBranch ? undefined : { name: '新建文件夹', callback: this._menu_createDirectory },
            ],
            [   //删除
                this._root.props.noDelete || this._isRoot ? undefined : { name: '删除', callback: this._menu_delete },
            ],
            [   //重命名
                this._root.props.noRename || this._isRoot ? undefined : { name: '重命名', callback: this._menu_rename },
            ],
            [   //上传文件
                this._root.props.noUpload || !this._isBranch ? undefined : { name: '上传文件', callback: this._menu_uploadFile }
            ],
            [   //下载
                this._root.props.noDownload || this._isBranch ? undefined : { name: '下载文件', callback: this._menu_download },
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
            onDragOver: this._root.props.noPaste || !this._isBranch ? undefined : this._onDragOver,
            onDrop: this._root.props.noPaste || !this._isBranch ? undefined : this._onDrop,
        };
    }

    constructor(props: any, context: any) {
        super(props, context);

        const _watch_processingItems_add = (value: string) => {
            if (value === this._fullNameString)
                this._loading.add('_onProcessing');
        };

        const _watch_processingItems_remove = (value: string) => {
            if (value === this._fullNameString)
                this._loading.delete('_onProcessing');
        };

        //判断当前的节点是否正在操作中
        if (processingItems.has(this._fullNameString))
            _watch_processingItems_add(this._fullNameString);

        processingItems.on('add', _watch_processingItems_add);
        processingItems.on('remove', _watch_processingItems_remove);

        this._unobserve.push(() => {
            processingItems.off('add', _watch_processingItems_add);
            processingItems.off('remove', _watch_processingItems_remove);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if (this._isRoot) {
            EditableFileTree._copyItem = [];
            EditableFileTree._action = undefined;
        }
    }
}