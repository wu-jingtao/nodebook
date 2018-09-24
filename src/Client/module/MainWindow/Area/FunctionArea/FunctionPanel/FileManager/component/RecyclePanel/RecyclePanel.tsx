import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, oVar } from 'observable-variable';

import { FoldableContainer } from "../../../../../../../../global/Component/FoldableContainer/FoldableContainer";
import { FoldableContainerPropsType } from "../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType";
import { EditableFileTree } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { EditableFileTreePropsType } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTreePropsType';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { cachedFiles } from '../../UnsavedFiles';

const less = require('./RecyclePanel.less');

/**
 * 回收站
 */
export class RecyclePanel extends FoldableContainer<FoldableContainerPropsType & { height: ObservableVariable<string> }>{

    //拖拽到回收站上后显示删除图标
    private readonly _showTrashcanIcon = oVar(false);

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
                <img title="清空回收站" src="/static/res/img/buttons_icon/clear.svg" onClick={this._clearRecycle} />
                <img title="刷新" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshDirectory} />
                <img title="全部折叠" src="/static/res/img/buttons_icon/CollapseAll_inverse.svg" onClick={this._closeDirectory} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        return (
            <>
                <div style={{ display: this._showTrashcanIcon.value ? 'none' : 'block' }}>
                    <RecycleTree
                        name="/user_data/recycle"
                        memorable={this.props.uniqueID}
                        modifiedFiles={cachedFiles}
                        noCreate
                        noRename
                        noUpload
                        noZip
                        noPaste
                        ref={(e: any) => this._tree = e} />
                </div>
                <i className={classnames(less.trashIcon, 'iconfont icon-trash')} style={{ display: this._showTrashcanIcon.value ? 'block' : 'none' }} />
            </>
        );
    }

    componentDidMount() {
        super.componentDidMount();
        this.watch(this.props.height, this._showTrashcanIcon);

        //点击容器空白区域，清除所有选中选项
        this._content_div.click(e => {
            if (e.target === e.currentTarget)
                this._tree.unfocus();
        });

        //清除hover。因为使用了flex布局，Tree在边界的地方无法触发mouseleave事件
        this._content_div.mouseleave(() => {
            this._tree.unhover();
        });

        //拖拽到回收站上时显示删除图标
        this._content_div.on('dragenter', e => {
            const oe = e.originalEvent as DragEvent;

            //确保拖拽的不是回收站中的项目
            if (oe.dataTransfer.getData('EditableFileTree_drag') !== '/user_data/recycle') {
                e.stopPropagation();
                e.preventDefault();
                this._showTrashcanIcon.value = true;
            }
        });

        this._content_div.on('dragleave', e => {
            const oe = e.originalEvent as DragEvent;

            if (oe.dataTransfer.getData('EditableFileTree_drag') !== '/user_data/recycle') {
                e.stopPropagation();
                e.preventDefault();
                this._showTrashcanIcon.value = false;
            }
        });

        this._content_div.on('dragover', e => {
            const oe = e.originalEvent as DragEvent;

            if (oe.dataTransfer.getData('EditableFileTree_drag') !== '/user_data/recycle') {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        this._content_div.on('drop', e => {
            const oe = e.originalEvent as DragEvent;

            if (oe.dataTransfer.getData('EditableFileTree_drag') !== '/user_data/recycle') {
                e.stopPropagation();
                e.preventDefault();
                this._tree.deleteDragItem();
                this._showTrashcanIcon.value = false;
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._content_div.off('dragenter dragleave dragover drop click mouseleave');
    }

    render() {
        this._contentStyle = { height: this.props.height.value + '%' };
        return super.render();
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

    /**
     * 清空回收站
     */
    public async clearRecycle(): Promise<void> {
        try {
            await ServerApi.file.cleanRecycle();
        } catch (error) {
            showMessageBox({
                icon: 'error',
                title: `清空回收站失败`,
                content: error.message
            });
        }
    }

    /**
     * 删除拖拽的项目
     */
    public deleteDragItem(): void {
        this._menu_delete();
    }
}