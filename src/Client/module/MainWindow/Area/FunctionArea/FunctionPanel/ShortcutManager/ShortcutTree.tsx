import * as React from 'react';
import { ObservableVariable, oMap, oVar, oArr, ObservableMap } from "observable-variable";
import debounce = require('lodash.debounce');
import clipboard = require('copy-text-to-clipboard');

import { FileIconTree } from "../../../../../../global/Component/Tree/FileIconTree/FileIconTree";
import { FileIconTreePropsType } from "../../../../../../global/Component/Tree/FileIconTree/FileIconTreePropsType";
import { processingItems, checkIsBusy, dragText } from "../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree";
import { DeleteFiles } from '../../../../../../global/Component/Tree/EditableFileTree/DeleteFiles/DeleteFiles';
import { normalSettings } from "../../../../../../global/SystemSetting";
import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { ContextMenuItemOptions } from "../../../../../ContextMenu/ContextMenuOptions";
import { showMessageBox } from "../../../../../MessageBox/MessageBox";
import { showPopupWindow } from "../../../../../PopupWindow/PopupWindow";
import { InputShortcutName } from "./InputShortcutName/InputShortcutName";

const less = require('./ShortcutManager.less');

export class ShortcutTree extends FileIconTree<FileIconTreePropsType, { path: string }> {

    /**
     * 鼠标拖拽的项目
     */
    public static _dragItems: ShortcutTree[] = [];

    //保存在服务器端的原始JSON数据
    private readonly _originalData: ObservableVariable<string> = this._root._originalData || normalSettings.get('client.shortcut');

    //保存数据修改
    private readonly _saveFolderData: () => void = this._root._saveFolderData ||
        debounce(() => { this._originalData.value = JSON.stringify(this._dataTree.subItem) }, 1000);

    /**
     * 复制当前快捷方式的绝对路径
     */
    protected readonly _menu_copyPath = () => {
        if (!this._isBranch) {
            if (!clipboard(this._dataTree.data.path)) {
                showMessageBox({ icon: 'message', title: '复制绝对路径失败，请手动复制', content: this._dataTree.data.path, autoClose: 0 });
            }
        }
    };

    //#region 创建、重命名、删除

    /**
     * 创建新的快捷方式
     */
    protected readonly _menu_createShortcut = () => {
        if (this._isBranch) {
            const shortcutName = oVar('');
            const filePath = oVar('');
            const errorTip = oArr(['', '']);

            showPopupWindow({
                title: '新建快捷方式',
                content: (
                    <InputShortcutName
                        name={shortcutName}
                        filePath={filePath}
                        errorTip={errorTip}
                        subItems={this._dataTree.subItem as any} />
                ),
                ok: {
                    callback: () => {
                        if (errorTip.every(item => item.length === 0)) {
                            const name = shortcutName.value || filePath.value.split('/').pop() as string;
                            (this._dataTree.subItem as any).set(name, {
                                name, data: { path: filePath.value }
                            });
                        }
                    }
                }
            });
        }
    };

    /**
     * 创建新的文件夹
     */
    protected readonly _menu_createDirectory = () => {
        if (this._isBranch) {
            const shortcutName = oVar('');
            const filePath = oVar('');
            const errorTip = oArr(['', '']);

            showPopupWindow({
                title: '新建文件夹',
                content: (
                    <InputShortcutName
                        isDirectory
                        name={shortcutName}
                        filePath={filePath}
                        errorTip={errorTip}
                        subItems={this._dataTree.subItem as any} />
                ),
                ok: {
                    callback: () => {
                        if (errorTip.every(item => item.length === 0)) {
                            (this._dataTree.subItem as any).set(shortcutName.value, {
                                name: shortcutName.value,
                                data: { path: filePath.value },
                                subItem: oMap([])
                            });
                        }
                    }
                }
            });
        }
    };

    /**
     * 重命名
     */
    protected readonly _menu_rename = () => {
        if (!this._isRoot) {
            const shortcutName = oVar(this._name);
            const filePath = oVar(this._dataTree.data.path);
            const errorTip = oArr(['', '']);

            showPopupWindow({
                title: '重命名',
                content: (
                    <InputShortcutName
                        isRename
                        isDirectory={this._isBranch}
                        name={shortcutName}
                        filePath={filePath}
                        errorTip={errorTip}
                        subItems={(this._parent as any)._dataTree.subItem} />
                ),
                ok: {
                    callback: () => {
                        if (errorTip.every(item => item.length === 0)) {
                            ((this._parent as any)._dataTree.subItem as any).delete(this._name);

                            const name = shortcutName.value || filePath.value.split('/').pop() as string;
                            ((this._parent as any)._dataTree.subItem as any).set(name, {
                                name,
                                data: { path: filePath.value },
                                subItem: this._dataTree.subItem
                            });
                        }
                    }
                }
            });
        }
    };

    /**
     * 删除
     */
    protected readonly _menu_delete = () => {
        if (!this._isRoot) {
            if (!this._focusedItem.has(this)) {
                this._focusedItem.clear();
                this._focusedItem.add(this);
            }

            const items = [...this._focusedItem.values()];

            showPopupWindow({
                title: '确定要删除吗?',
                content: <DeleteFiles items={items.map(item => ({
                    name: item._isBranch ? item._name : item._dataTree.data.path,
                    fullName: item._name,
                    isDirectory: item._isBranch
                }))} />,
                ok: {
                    callback: () => {
                        items.forEach(item => {
                            (item._parent as any)._dataTree.subItem.delete(item._name);
                            item._focusedItem.delete(item);
                        });
                    }
                }
            });
        }
    };

    //#endregion

    //#region 下载

    /**
     * 下载文件
     */
    protected readonly _menu_download = () => {
        if (!this._isBranch && checkIsBusy(this._dataTree.data.path))
            window.open(`/file/api/readFile?download=true&path=${this._dataTree.data.path}`);
    };

    /**
     * 压缩下载
     */
    protected readonly _menu_zip_download = () => {
        if (!this._isBranch && checkIsBusy(this._dataTree.data.path))
            window.open(`/file/api/zipDownloadData?path=${this._dataTree.data.path}`);
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
        if (items.every(item => !item._isRoot))
            ShortcutTree._dragItems = items;
        else
            ShortcutTree._dragItems = [];

        //设置拖拽鼠标图标
        if (ShortcutTree._dragItems.length > 0)
            dragText.text(ShortcutTree._dragItems.map(item => item._name).join('，'));
        else
            dragText.text('禁止拖拽');

        e.dataTransfer.setDragImage(dragText[0], -20, 0);

        //配置数据
        e.dataTransfer.setData('shortcut_tree_drag', '');
        e.dataTransfer.setData('text/plain', ShortcutTree._dragItems.map(item =>
            item._isBranch ? item._name : item._dataTree.data.path).join('\n'));
    };

    private readonly _onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();

        ShortcutTree._dragItems = [];
    };

    /**
     * 只有目录才需要
     */
    private readonly _onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (this._isBranch) {
            //确保拖拽的数据类型
            if (e.dataTransfer.types.includes('shortcut_tree_drag')) {
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

            for (const item of ShortcutTree._dragItems) {
                (item._parent as any)._dataTree.subItem.delete(item._name);

                const name = this._deduplicateShortcutName(this._dataTree.subItem, item._name);
                this._dataTree.subItem.set(name, {
                    name,
                    data: item._dataTree.data,
                    subItem: item._dataTree.subItem
                });
            }
        }
    };

    /**
     * 为重复的名称后加上序号。没有重复就直接返回
     */
    protected _deduplicateShortcutName(subItem: ObservableMap<string, any>, shortcutName: string): string {
        let name = shortcutName;

        if (subItem.has(name)) {   //如果名称重复
            let index = 1;
            while (true) {
                if (!subItem.has(name = shortcutName.replace(/(?![^\.]+)(\.?)/, `(${index++})$1`)))
                    break;
            }
        }

        return name;
    }

    //#endregion

    constructor(props: any, context: any) {
        super(props, context);

        //读取快捷方式数据
        if (this._isRoot) {
            try {
                this._dataTree.subItem = JSON.parse(this._originalData.value);
            } catch (error) {
                showMessageBox({
                    icon: 'error',
                    title: '初始化快捷方式失败',
                    content: '快捷方式数据不是有效的JSON字符串'
                });
            }
        }

        //添加保存数据监听器
        if (this._dataTree.subItem) {
            oMap(this._dataTree, 'subItem');    //由于序列化的原因，确保subItem是ObservableMap
            this._dataTree.subItem.on('add', this._saveFolderData); //重复注册监听器不会有影响
            this._dataTree.subItem.on('remove', this._saveFolderData);
        }

        //相关文件操作加载动画
        if (!this._isBranch) {
            const _watch_processingItems_add = (value: string) => {
                if (value === this._dataTree.data.path)
                    this._loading.add('_onProcessing');
            };

            const _watch_processingItems_remove = (value: string) => {
                if (value === this._dataTree.data.path)
                    this._loading.delete('_onProcessing');
            };

            //判断当前的节点是否正在操作中
            if (processingItems.has(this._dataTree.data.path))
                _watch_processingItems_add(this._dataTree.data.path);

            processingItems.on('add', _watch_processingItems_add);
            processingItems.on('remove', _watch_processingItems_remove);

            this._unobserve.push(() => {
                processingItems.off('add', _watch_processingItems_add);
                processingItems.off('remove', _watch_processingItems_remove);
            });
        }

        //文件图标以及对应的文件名
        if (!this._isBranch) {
            this._fileIcon_url.value = '/static/res/img/file_icons/' + getIconPath(this._dataTree.data.path);
            this._fileIcon_displayContent.value = (
                <>
                    <span>{this._name}</span>
                    <span className={less.shortcutFilePath}>{this._dataTree.data.path}</span>
                </>
            );
        }
    }

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
        return {
            ...parentProps,
            draggable: this._isRoot ? false : true,
            onDragStart: this._isRoot ? undefined : this._onDragStart,
            onDragEnd: this._isRoot ? undefined : this._onDragEnd,
            onDragOver: !this._isBranch ? undefined : this._onDragOver,
            onDrop: !this._isBranch ? undefined : this._onDrop,
            title: this._isBranch ? this._name : this._dataTree.data.path
        };
    }

    protected async _onOpenBranch(isOpen: boolean): Promise<false | void> { }

    protected async _onOpenItem(e: React.MouseEvent<HTMLDivElement>): Promise<void> {
        //TODO 等所有窗口都做完之后添加
    }

    protected _onContextMenu(): (ContextMenuItemOptions | void | false)[][] {
        return [
            [   //创建
                !this._isBranch ? undefined : { name: '新建快捷方式', callback: this._menu_createShortcut },
                !this._isBranch ? undefined : { name: '新建文件夹', callback: this._menu_createDirectory },
            ],
            [   //删除
                this._isRoot ? undefined : { name: '删除', callback: this._menu_delete },
            ],
            [   //重命名
                this._isRoot ? undefined : { name: '重命名', callback: this._menu_rename },
            ],
            [   //复制对应文件的路径
                this._isBranch ? undefined : { name: '复制绝对路径', callback: this._menu_copyPath },
            ],
            [   //下载
                this._isBranch ? undefined : { name: '下载文件', callback: this._menu_download },
                this._isBranch || this._name.endsWith('.zip') ? undefined : { name: '压缩下载', callback: this._menu_zip_download },
            ],
        ];
    }

    /**
     * 在焦点目录下创建快捷方式
     */
    public createShortcut() {
        let target = [...this._focusedItem.values()].pop() || this._root;
        target = target._dataTree.subItem ? target : target._parent as any;
        target._menu_createShortcut();
    }

    /**
     * 在焦点目录下创建文件夹
     */
    public createDirectory() {
        let target = [...this._focusedItem.values()].pop() || this._root;
        target = target._dataTree.subItem ? target : target._parent as any;
        target._menu_createDirectory();
    }
}