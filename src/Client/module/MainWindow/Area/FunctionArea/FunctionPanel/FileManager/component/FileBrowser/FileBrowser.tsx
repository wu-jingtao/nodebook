import * as React from 'react';
import { oMap } from 'observable-variable';

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { DataTree } from '../../../../../../../../global/Component/Tree/TreePropsType';
import { FileTree, FileTreeInner } from '../FileTree/FileTree';
import { FileBrowserPropsType } from './FileBrowserPropsType';

const less = require('./FileBrowser.less');

/**
 * 文件资源浏览器
 */
export class FileBrowser extends FoldableContainer<FileBrowserPropsType> {

    protected _titleBarClassName = less.titleBar;
    protected _contentClassName = less.contentBox;

    protected _fileTree: FileTreeInner;

    componentDidMount() {
        super.componentDidMount();

        //点击容器空白区域，清除所有选中选项
        this._content_div.click(e => {
            if (e.target === e.currentTarget)
                this._fileTree.unfocus();
        });

        //清除hover。因为使用了flex布局，Tree在边界的地方无法触发mouseleave事件
        this._content_div.mouseleave(() => {
            this._fileTree.unhover();
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._content_div.off('click mouseleave');
    }

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <i title="新建文件" className="iconfont icon-file-add-fill" onClick={e => e.stopPropagation()} />
                <i title="新建文件夹" className="iconfont icon-file2" onClick={e => e.stopPropagation()} />
                <i title="刷新" className="iconfont icon-fresh" onClick={e => e.stopPropagation()} />
                <i title="全部折叠" className="iconfont icon-iconcloseall" onClick={e => e.stopPropagation()} />
            </div>
        );
    }

    datatree: DataTree = {
        name: '/user_data/code',
        subItem: oMap([])
    };

    protected renderContent(): JSX.Element {
        return <FileTreeInner
            fullName={["/user_data/code"]}
            uniqueID="test_tree"
            dataTree={this.datatree}
            ref={e => this._fileTree = e as any} />;
    }
}




/**
 * 

    

 */