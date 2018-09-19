import * as React from 'react';

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { EditableFileTree } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { FoldableContainerPropsType } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';

const less = require('./FileFoldableContainer.less');

/**
 * 文件折叠容器
 */
export abstract class FileFoldableContainer<T extends FoldableContainerPropsType> extends FoldableContainer<T> {

    protected _titleBarClassName = less.titleBar;
    protected _contentClassName = less.contentBox;

    /**
     * 对于文件树的引用
     */
    protected abstract _tree: EditableFileTree<any>;

    /**
     * 标题栏上面的按钮
     */
    protected abstract _titleBarButtons: JSX.Element;

    componentDidMount() {
        super.componentDidMount();

        //点击容器空白区域，清除所有选中选项
        this._content_div.click(e => {
            if (e.target === e.currentTarget)
                this._tree.unfocus();
        });

        //清除hover。因为使用了flex布局，Tree在边界的地方无法触发mouseleave事件
        this._content_div.mouseleave(() => {
            this._tree.unhover();
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._content_div.off('click mouseleave');
    }

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                {this._titleBarButtons}
            </div>
        );
    }
}