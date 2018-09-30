import * as React from 'react';
import throttle = require('lodash.throttle');

import { EditableFileTree } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { EditableFileTreePropsType } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTreePropsType';
import { MultipleFoldableContainerItem } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainer';
import { MultipleFoldableContainerItemPropsType } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainerPropsType';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { cachedFiles } from '../../UnsavedFiles';

const less = require('./RecyclePanel.less');

/**
 * 刷新回收站根目录
 */
export let refreshRecycleRoot: Function | undefined;

/**
 * 回收站
 */
export class RecyclePanel extends MultipleFoldableContainerItem<MultipleFoldableContainerItemPropsType> {

    private readonly _clearRecycle = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.clearRecycle();
    };

    private readonly _refreshDirectory = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.refreshAllFolder();
    };

    private readonly _closeDirectory = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.closeAllBranch();
    };

    protected _tree: RecycleTree;

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="清空回收站" src="/static/res/img/buttons_icon/kill-inverse.svg" onClick={this._clearRecycle} />
                <img title="刷新" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshDirectory} />
                <img title="全部折叠" src="/static/res/img/buttons_icon/CollapseAll_inverse.svg" onClick={this._closeDirectory} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        return (
            <RecycleTree
                name="/user_data/recycle"
                memorable={this.props.uniqueID}
                modifiedFiles={cachedFiles}
                noCreate noRename noUpload noZip noPaste
                ref={(e: any) => this._tree = e} />
        );
    }

    componentDidMount() {
        super.componentDidMount();

        //点击容器空白区域，清除所有选中选项
        this._content_div.on('click', e => {
            if (e.target === e.currentTarget)
                this._tree.unfocus();
        });

        this._content_div.on('dragover', e => {
            const dt = (e.originalEvent as DragEvent).dataTransfer as DataTransfer;
            
            if (dt.types.includes('editable_file_tree_drag')) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        this._content_div.on('drop', e => {
            e.stopPropagation();
            e.preventDefault();

            const dt = (e.originalEvent as DragEvent).dataTransfer as DataTransfer;
            if (dt.getData('editable_file_tree_drag') !== '/user_data/recycle') {
                this._tree.deleteDragItems();
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._content_div.off('click dragover drop');
    }
}

class RecycleTree extends EditableFileTree<EditableFileTreePropsType> {

    protected async _onDelete(): Promise<void> {
        await ServerApi.file.deleteRecycleData(this._fullNameString);
    }

    protected _onOpenItem(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 1000);
        });
    }

    componentDidMount() {
        if (this._isRoot) refreshRecycleRoot = throttle(() => this._root._refreshFolder(), 1000);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (this._isRoot) refreshRecycleRoot = undefined;
    }

    /**
     * 清空回收站
     */
    public clearRecycle(): void {
        showPopupWindow({
            title: '清空回收站',
            content: <span>确定要清空回收站吗?</span>,
            ok: {
                callback: async () => {
                    try {
                        await ServerApi.file.cleanRecycle();
                        this._root._refreshFolder();
                    } catch (error) {
                        showMessageBox({
                            icon: 'error',
                            title: `清空回收站失败`,
                            content: error.message
                        });
                    }
                }
            }
        });
    }

    /**
     * 删除拖拽的项目
     */
    public deleteDragItems() {
        const items = EditableFileTree._copyItem;
        EditableFileTree._copyItem = [];
        this._prepareDelete(items);
    }
}