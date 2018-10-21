import * as React from 'react';

import { FoldableContainer } from "../../../../../../global/Component/FoldableContainer/FoldableContainer";
import { FoldableContainerPropsType } from "../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType";
import { unsavedFiles } from '../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';
import { ShortcutTree } from './ShortcutTree';

const less = require('./ShortcutManager.less');

export class ShortcutPanel extends FoldableContainer<FoldableContainerPropsType> {

    private _tree: ShortcutTree;

    private readonly _createShortcut = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.createShortcut();
    };

    private readonly _createDirectory = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.createDirectory();
    };

    private readonly _closeAllBranch = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.closeAllBranch();
    };

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="新建快捷方式" src="/static/res/img/buttons_icon/add_inverse.svg" onClick={this._createShortcut} />
                <img title="新建文件夹" src="/static/res/img/buttons_icon/AddFolder_inverse.svg" onClick={this._createDirectory} />
                <img title="全部折叠" src="/static/res/img/buttons_icon/CollapseAll_inverse.svg" onClick={this._closeAllBranch} />
            </div>
        );
    }

    protected renderContent(): React.ReactNode {
        return (
            <ShortcutTree
                name="快捷方式列表"
                memorable={this.props.uniqueID}
                ref={(e: any) => this._tree = e}
                modifiedFiles={unsavedFiles} />
        );
    }
}