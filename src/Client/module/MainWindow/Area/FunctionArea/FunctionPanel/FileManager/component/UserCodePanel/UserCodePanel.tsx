import * as React from 'react';
import { oVar } from 'observable-variable';

import { ServerApi } from '../../../../../../../../global/ServerApi';
import { EditableFileTree } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { EditableFileTreePropsType } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTreePropsType';
import { MultipleFoldableContainerItem } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainer';
import { MultipleFoldableContainerItemPropsType } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainerPropsType';
import { refreshRecycleRoot } from '../RecyclePanel/RecyclePanel';
import { openWindow, windowList, closeWindow } from '../../../../../ContentWindow/WindowList';
import { CodeEditorWindowArgs, WindowType } from '../../../../../ContentWindow/ContentWindowTypes';
import { unsavedFiles, editorData } from '../../../../../ContentWindow/FileCache';

const less = require('./UserCodePanel.less');

/**
 * 用户代码目录
 */
export class UserCodePanel extends MultipleFoldableContainerItem<MultipleFoldableContainerItemPropsType>  {

    private readonly _createFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.createFile();
    };

    private readonly _createDirectory = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.createDirectory();
    };

    private readonly _refreshDirectory = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.refreshAllFolder();
    };

    private readonly _closeDirectory = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.closeAllBranch();
    };

    protected _tree: UserCodeTree;

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="新建文件" src="/static/res/img/buttons_icon/AddFile_inverse.svg" onClick={this._createFile} />
                <img title="新建文件夹" src="/static/res/img/buttons_icon/AddFolder_inverse.svg" onClick={this._createDirectory} />
                <img title="刷新" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshDirectory} />
                <img title="全部折叠" src="/static/res/img/buttons_icon/CollapseAll_inverse.svg" onClick={this._closeDirectory} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        return <UserCodeTree
            name="/user_data/code"
            memorable={this.props.uniqueID}
            ref={(e: any) => this._tree = e}
            modifiedFiles={unsavedFiles} />
    }

    componentDidMount() {
        super.componentDidMount();

        //点击容器空白区域，清除所有选中选项
        this._content_div.on('click', e => {
            if (e.target === e.currentTarget)
                this._tree.unfocus();
        });

        //确保拖拽文件到空白区域也可以上传文件
        this._content_div.on('dragover', e => {
            if (e.target === this._content_div[0]) {
                const dt = (e.originalEvent as DragEvent).dataTransfer as DataTransfer;
                if (dt.types.includes('editable_file_tree_drag') || dt.types.includes('Files')) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        });

        this._content_div.on('drop', e => {
            if (e.target === this._content_div[0]) {
                e.stopPropagation();
                e.preventDefault();

                const dt = (e.originalEvent as DragEvent).dataTransfer as DataTransfer;

                if (dt.files.length > 0)
                    [...dt.files].forEach(file => this._tree.uploadFile(file));
                else
                    this._tree.pasteDragItems(e.ctrlKey ? 'copy' : 'cut');
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._content_div.off('dragover drop click');
    }
}

export class UserCodeTree extends EditableFileTree<EditableFileTreePropsType> {

    protected async _onDelete(): Promise<void> {
        await ServerApi.file.deleteCodeData(this._fullNameString);
        refreshRecycleRoot && refreshRecycleRoot();
        this._closeWindow();
        this._deleteUnsavedFile();
    }

    /**
     * 关闭与文件相关的窗口
     */
    protected _closeWindow(): void {
        const win: { id: string, side: 'left' | 'right' }[] = [];

        for (const item of windowList.leftWindows.windowList.value) {
            const itemPath: string | void = item.args && item.args.path;
            if (itemPath) {
                if (this._dataTree.subItem) {
                    if (itemPath.startsWith(this._fullNameString))
                        win.push({ id: item.id, side: 'left' });
                } else {
                    if (itemPath === this._fullNameString) {
                        win.push({ id: item.id, side: 'left' });
                        break;
                    }
                }
            }
        }

        for (const item of windowList.rightWindows.windowList.value) {
            const itemPath: string | void = item.args && item.args.path;
            if (itemPath) {
                if (this._dataTree.subItem) {
                    if (itemPath.startsWith(this._fullNameString))
                        win.push({ id: item.id, side: 'right' });
                } else {
                    if (itemPath === this._fullNameString) {
                        win.push({ id: item.id, side: 'right' });
                        break;
                    }
                }
            }
        }

        win.forEach(({ id, side }) => closeWindow(id, side));
    }

    /**
     * 删除未保存文件
     */
    protected _deleteUnsavedFile(): void {
        for (const item of editorData.keys()) {
            if (this._dataTree.subItem) {
                if (item.startsWith(this._fullNameString))
                    editorData.delete(item);
            } else {
                if (item === this._fullNameString) {
                    editorData.delete(item);
                    break;
                }
            }
        }
    }

    protected async _onOpenItem(): Promise<void> {
        const args: CodeEditorWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: this._name,
            type: WindowType.code_editor,
            args: {
                path: this._fullNameString
            }
        };

        openWindow(args);
    }

    /**
     * 上传文件到根
     */
    public uploadFile(file: File) {
        this._root._prepareUploadFile(file);
    }

    /**
     * 粘贴文件
     */
    public pasteDragItems(action: 'copy' | 'cut') {
        const items = EditableFileTree._copyItem;
        EditableFileTree._copyItem = [];
        this._preparePaste(items, action);
    }
}