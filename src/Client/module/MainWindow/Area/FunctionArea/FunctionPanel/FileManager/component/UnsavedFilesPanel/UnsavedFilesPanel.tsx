import * as React from 'react';
import { oVar } from 'observable-variable';
import clipboard = require('copy-text-to-clipboard');

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { FoldableContainerPropsType } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { ObservableComponent } from '../../../../../../../../global/Tools/ObservableComponent';
import { FileIcon } from '../../../../../../../../global/Component/FileIcon/FileIcon';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { cachedFiles, removeCache, saveToServer } from '../../UnsavedFiles';
import { showContextMenu } from '../../../../../../../ContextMenu/ContextMenu';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { ContextMenuItemOptions } from '../../../../../../../ContextMenu/ContextMenuOptions';
import { openWindow } from '../../../../../ContentWindow/ContentWindow';

const less = require('./UnsavedFilesPanel.less');

/**
 * 未保存的文件列表
 */
export class UnsavedFilesPanel extends FoldableContainer<FoldableContainerPropsType>  {

    private readonly _contentItemsList: Map<string, ContentItem> = new Map();

    private readonly _saveAll = () => {
        for (const item of this._contentItemsList.values()) {
            item._menu_save();
        }
    };

    private readonly _undoAll = () => {
        showPopupWindow({
            title: '放弃所有更改',
            content: <span>确认要放弃所有更改吗?</span>,
            ok: {
                callback: () => {
                    for (const item of this._contentItemsList.values()) {
                        item._menu_undo();
                    }
                }
            }
        });
    };

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="保存全部" src="/static/res/img/buttons_icon/saveall_inverse.svg" onClick={this._saveAll} />
                <img title="全部放弃保存" src="/static/res/img/buttons_icon/undo-inverse.svg" onClick={this._undoAll} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        return [...cachedFiles.values()].map(fullName => (
            <ContentItem key={fullName} fullName={fullName}
                ref={e => e ? this._contentItemsList.set(fullName, e) : this._contentItemsList.delete(fullName)} />
        )) as any;
    }

    componentDidMount() {
        super.componentDidMount();
        this.watch(cachedFiles);
    }

    render() {
        if (cachedFiles.size > 0)
            return super.render();
        else
            return false as any;
    }
}

class ContentItem extends ObservableComponent<{ fullName: string }> {

    private readonly _name = this.props.fullName.split('/').pop() as string;

    /**
     * 是否正在处理
     */
    private readonly _processing = oVar(false);

    /**
    * 复制当前文件的绝对路径
    */
    private readonly _menu_copyPath = () => {
        if (!clipboard(this.props.fullName)) {
            showMessageBox({ icon: 'message', title: '复制绝对路径失败，请手动复制', content: this.props.fullName, autoClose: 0 });
        }
    };

    /**
     * 保存到服务器
     */
    public readonly _menu_save = async () => {
        if (this._processing.value === false) {
            this._processing.value = true;
            await saveToServer(this.props.fullName);
            this._processing.value = false;
        }
    };

    /**
     * 取消保存
     */
    public readonly _menu_undo = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (this._processing.value === false) {
            this._processing.value = true;
            await removeCache(this.props.fullName);
            this._processing.value = false;
        }
    };

    /**
     * 右键菜单
     */
    private readonly _contextMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 2) {
            const menuItems: ContextMenuItemOptions[][] = [];

            if (this._processing.value === false) {
                menuItems.push([
                    { name: '保存', callback: this._menu_save },
                    { name: '放弃保存', callback: this._menu_undo }
                ]);
            }

            menuItems.push([{ name: '复制绝对路径', callback: this._menu_copyPath }]);

            showContextMenu({ position: { x: e.clientX, y: e.clientY }, items: menuItems });
        }
    }

    /**
     * 打开代码编辑器
     */
    private readonly _openEditor = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 0)
            openWindow(this.props.fullName, 'file');
    };

    render() {
        return (
            <div className={less.contentItem} onClick={this._openEditor} onContextMenu={this._contextMenu}>
                {this._processing.value ? <i className={less.loading} /> :
                    <div className={less.undo} title="放弃保存" onClick={this._menu_undo}>×</div>}
                <FileIcon className={less.fileIcon} filename={this._name} />
                <div className={less.fileName}>{this._name}</div>
                <div className={less.fileFullName}>{this.props.fullName}</div>
            </div>
        );
    }
}