import * as React from 'react';

import * as FilePath from '../../../../../../../../../Server/FilePath';

import { MultipleFoldableContainerItem } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainer';
import { MultipleFoldableContainerItemPropsType } from '../../../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainerPropsType';
import { UserCodeTree } from '../UserCodePanel/UserCodePanel';
import { unsavedFiles } from '../../../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';

const less = require('../UserCodePanel/UserCodePanel.less');

/**
 * 类库目录
 */
export class LibraryPanel extends MultipleFoldableContainerItem<MultipleFoldableContainerItemPropsType> {

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
                <img title="刷新" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshDirectory} />
                <img title="全部折叠" src="/static/res/img/buttons_icon/CollapseAll_inverse.svg" onClick={this._closeDirectory} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        return <UserCodeTree
            name={FilePath._libraryDir}
            memorable={this.props.uniqueID}
            ref={(e: any) => this._tree = e}
            modifiedFiles={unsavedFiles}
            noCopyCut noCreate noDelete noPaste noRename noUpload noZip />
    }

    componentDidMount() {
        super.componentDidMount();

        //点击容器空白区域，清除所有选中选项
        this._content_div.on('click', e => {
            if (e.target === e.currentTarget)
                this._tree.unfocus();
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._content_div.off('click');
    }
}