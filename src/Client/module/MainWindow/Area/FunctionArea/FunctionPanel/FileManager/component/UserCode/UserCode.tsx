import * as React from 'react';
import { watch } from 'observable-variable';

import { EditableFileTree } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { FileBrowser } from '../FileBrowser/FileBrowser';
import { UserCodePropsType, UserCodeTreePropsType } from './UserCodePropsType';

/**
 * 用户代码目录
 */
export class UserCode extends FileBrowser<UserCodePropsType> {

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

    protected _tree: EditableFileTree<any>;

    protected _titleBarButtons: JSX.Element = <>
        <i title="新建文件" className="iconfont icon-file-add-fill" onClick={this._createFile} />
        <i title="新建文件夹" className="iconfont icon-file2" onClick={this._createDirectory} />
        <i title="刷新" className="iconfont icon-fresh" onClick={this._refreshDirectory} />
        <i title="全部折叠" className="iconfont icon-iconcloseall" onClick={this._closeDirectory} />
    </>;

    protected renderContent(): JSX.Element {
        return <UserCodeTree
            name="/user_data/code"
            memorable={this.props.uniqueID}
            fileManagerNumber={this.props.fileManagerNumber}
            contentWindows={this.props.contentWindows}
            ref={(e: any) => this._tree = e} />
    }
}

class UserCodeTree extends EditableFileTree<UserCodeTreePropsType> {

    private readonly _watch_modified: Function;

    protected async _onDelete(): Promise<void> {
        await ServerApi.file.deleteCodeData(this._fullNameString);
    }

    protected _onOpenItem(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 1000);
        });
    }

    constructor(props: any, context: any) {
        super(props, context);

        if (this._isRoot) {
            this.props.fileManagerNumber.value = this._modified.length
            this._watch_modified = watch([this._modified], () => this.props.fileManagerNumber.value = this._modified.length);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if (this._isRoot) this._watch_modified();
    }
}