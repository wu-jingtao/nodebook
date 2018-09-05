import * as React from 'react';

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { DataTree } from '../../../../../../../../global/Component/Tree/TreePropsType';
import { Tree } from '../../../../../../../../global/Component/Tree/Tree';
import { FileBrowserPropsType } from './FileBrowserPropsType';
import { oMap } from 'observable-variable';

const less = require('./FileBrowser.less');

/**
 * 文件资源浏览器
 */
export class FileBrowser extends FoldableContainer<FileBrowserPropsType> {

    protected _titleBarClassName = less.titleBar;
    protected _contentClassName = less.contentBox;

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
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
        name: 'root',
        subItem: oMap([
            ['a', { name: 'a' }],
            ['b', { name: 'b' }],
            ['c', {
                name: 'c', subItem: oMap([
                    ['d1', { name: 'd1' }],
                    ['d2', { name: 'd2' }]
                ])
            }],
        ]) as any
    };

    protected renderContent(): JSX.Element {
        return <FileTree fullName={["root"]} uniqueID="test_tree" dataTree={this.datatree} />;
    }
}

class FileTree extends Tree {

    _onOpenBranch(): Promise<false | void> {
        return new Promise<false | void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    _renderItem(): JSX.Element {
        return (
            <div>{this._name}</div>
        );
    }
}