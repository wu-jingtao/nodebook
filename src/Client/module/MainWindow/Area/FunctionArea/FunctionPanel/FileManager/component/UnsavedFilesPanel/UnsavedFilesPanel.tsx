import * as React from 'react';
import { oVar } from 'observable-variable';

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { processingItems } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { FoldableContainerPropsType } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { ObservableComponent, ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { FileIcon } from '../../../../../../../../global/Component/FileIcon/FileIcon';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { showContextMenu } from '../../../../../../../ContextMenu/ContextMenu';
import { CodeEditorWindowArgs, WindowType } from '../../../../../ContentWindow/ContentWindowTypes';
import { openWindow } from '../../../../../ContentWindow/WindowList';
import { unsavedFiles, saveToServer, discardChange } from '../../../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';

const less = require('../OpenedWindows/OpenedWindows.less');

/**
 * 未保存的文件列表
 */
export class UnsavedFilesPanel extends FoldableContainer<FoldableContainerPropsType>  {

    private readonly _saveAll = () => {
        unsavedFiles.forEach(item => saveToServer(item));
    };

    private readonly _undoAll = () => {
        showPopupWindow({
            title: '放弃所有更改',
            content: <span>确认要放弃所有更改吗?</span>,
            ok: {
                callback() {
                    unsavedFiles.forEach(item => discardChange(item));
                }
            }
        });
    };

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="保存全部" src="/static/res/img/buttons_icon/save-inverse.svg" onClick={this._saveAll} />
                <img title="全部放弃保存" src="/static/res/img/buttons_icon/clean-dark.svg" onClick={this._undoAll} />
            </div>
        );
    }

    protected renderContent() {
        return [...unsavedFiles.values()].map(path => <UnsavedFilesPanelItem key={path} path={path} />)
    }

    componentDidMount() {
        super.componentDidMount();
        this.watch([unsavedFiles]);
    }

    render() {
        this._titleBarStyle.display = unsavedFiles.size === 0 ? 'none' : '';
        return super.render();
    }
}

class UnsavedFilesPanelItem extends ObservableComponent<{ path: string }> {

    //文件名称
    private readonly _name = this.props.path.split('/').pop() as string;

    //取消保存按钮和加载动画
    private readonly _undoAndLoading = (
        <ObservableComponentWrapper watch={[processingItems]}
            render={() => processingItems.has(this.props.path) ?
                <i className={less.loading} /> :
                <div className={less.close} title="放弃保存" onClick={() => discardChange(this.props.path)}>×</div>
            } />
    );

    /**
     * 右键菜单
     */
    private readonly _contextMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 2) {
            showContextMenu({
                position: { x: e.clientX, y: e.clientY },
                items: [
                    [
                        { name: '保存', callback: () => saveToServer(this.props.path) },
                        { name: '放弃保存', callback: () => discardChange(this.props.path) }
                    ]
                ]
            });
        }
    }

    /**
     * 打开代码编辑器
     */
    private readonly _openEditor = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 0) {
            const args: CodeEditorWindowArgs = {
                id: Math.random().toString(),
                name: this._name,
                type: WindowType.code_editor,
                fixed: oVar(false),
                args: {
                    path: this.props.path,
                    diff: true
                }
            };

            openWindow(args);
        }
    };

    render() {
        return (
            <div className={less.contentItem} onClick={this._openEditor} onContextMenu={this._contextMenu}>
                {this._undoAndLoading}
                <FileIcon className={less.fileIcon} filename={this.props.path} />
                <div className={less.fileName}>{this._name}</div>
                <div className={less.fileFullName}>{this.props.path}</div>
            </div>
        );
    }
}