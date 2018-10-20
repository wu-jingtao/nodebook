import * as React from 'react';

import { FoldableContainer } from "../../../../../../global/Component/FoldableContainer/FoldableContainer";
import { FoldableContainerPropsType } from "../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType";
import { unsavedFiles } from '../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';
import { ShortcutTree } from './ShortcutTree';

const less = require('./ShortcutManager.less');

export class ShortcutPanel extends FoldableContainer<FoldableContainerPropsType> {

    private _tree: ShortcutTree;

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="新建快捷方式" src="/static/res/img/buttons_icon/add_inverse.svg"
                    onClick={() => this._tree.createShortcut()} />
                <img title="新建文件夹" src="/static/res/img/buttons_icon/AddFolder_inverse.svg"
                    onClick={() => this._tree.createDirectory()} />
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