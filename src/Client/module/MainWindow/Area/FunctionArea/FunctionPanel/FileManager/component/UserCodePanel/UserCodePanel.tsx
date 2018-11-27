import * as React from 'react';
import { watch, ObservableVariable } from 'observable-variable';

import { ServerApi } from '../../../../../../../../global/ServerApi';
import { EditableFileTree } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { EditableFileTreePropsType } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTreePropsType';
import { MultipleFoldableContainerItem } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainer';
import { MultipleFoldableContainerItemPropsType } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainerPropsType';
import { closeWindowByPath, openWindowByFilePath } from '../../../../../ContentWindow/WindowList';
import { unsavedFiles, discardChange } from '../../../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';
import { taskList } from '../../../TaskManager/TaskList';
import { refreshRecycle } from '../RecyclePanel/RefreshRecycle';
import { checkUnsavedFile } from './DeleteUnsavedFiles';
import { checkTaskOrServiceFile } from './DeleteTaskOrServiceFile';

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
        if (await checkUnsavedFile(this._fullNameString, 'delete', this._isBranch)) {
            if (await checkTaskOrServiceFile(this._fullNameString, 'delete', this._isBranch)) {
                await ServerApi.file.deleteCodeData(this._fullNameString);
                refreshRecycle();
                closeWindowByPath(this._fullNameString, this._isBranch);
                discardChange(this._fullNameString, this._isBranch);
            }
        }
    }

    protected async _onCut(to: string): Promise<void> {
        if (await checkUnsavedFile(this._fullNameString, 'cut', this._isBranch)) {
            if (await checkTaskOrServiceFile(this._fullNameString, 'cut', this._isBranch)) {
                await super._onCut(to);
                closeWindowByPath(this._fullNameString, this._isBranch);
                discardChange(this._fullNameString, this._isBranch);
            }
        }
    }

    protected async _onOpenItem(e: React.MouseEvent<HTMLDivElement>): Promise<void> {
        openWindowByFilePath(
            this._fullNameString,
            this._dataTree.data.isBinary,
            this._dataTree.data.size,
            e.altKey ? 'right' : undefined,
            this._root.props.noCreate
        );
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

    componentDidMount() {
        //根据任务的运行状态，改变背景色
        if (!this._isBranch && this._name.endsWith('.server.js')) {
            let unWatchStatus = () => { };

            const onAdd = (status: ObservableVariable<'running' | 'debugging' | 'stop' | 'crashed'>, filePath: string) => {
                if (filePath === this._fullNameString) {
                    const setBackgroundColor = () => {
                        switch (status.value) {
                            case 'running':
                                this._backgroundColor.value = '#89d185';
                                break;

                            case 'debugging':
                                this._backgroundColor.value = '#fc0';
                                break;

                            case 'crashed':
                                this._backgroundColor.value = '#f48771';
                                break;

                            default:
                                this._backgroundColor.value = undefined;
                                break;
                        }
                    };

                    unWatchStatus = watch([status], setBackgroundColor);
                    setBackgroundColor();
                }
            };

            const onRemove = (status: ObservableVariable<'running' | 'debugging' | 'stop' | 'crashed'>, filePath: string) => {
                if (filePath === this._fullNameString) {
                    this._backgroundColor.value = undefined;
                    unWatchStatus();
                    unWatchStatus = () => { };
                }
            };

            taskList.on('add', onAdd);
            taskList.on('remove', onRemove);
            this._unobserve.push(() => taskList.off('add', onAdd));
            this._unobserve.push(() => taskList.off('remove', onRemove));
            this._unobserve.push(() => unWatchStatus());

            if (taskList.has(this._fullNameString))
                onAdd(taskList.get(this._fullNameString), this._fullNameString);
        }
    }
}