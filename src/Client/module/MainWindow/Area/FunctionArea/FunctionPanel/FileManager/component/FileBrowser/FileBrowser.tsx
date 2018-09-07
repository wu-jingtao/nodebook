import * as React from 'react';

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { DataTree } from '../../../../../../../../global/Component/Tree/TreePropsType';
import { Tree } from '../../../../../../../../global/Component/Tree/Tree';
import { FileBrowserPropsType } from './FileBrowserPropsType';
import { oMap } from 'observable-variable';

import { showContextMenu } from '../../../../../../../ContextMenu/ContextMenu';

const less = require('./FileBrowser.less');

/**
 * 文件资源浏览器
 */
export class FileBrowser extends FoldableContainer<FileBrowserPropsType> {

    protected _titleBarClassName = less.titleBar;
    protected _contentClassName = less.contentBox;

    protected _fileTree: FileTree;

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
        return <FileTree fullName={["root"]} uniqueID="test_tree" dataTree={this.datatree} ref={e => this._fileTree = e as any} />;
    }
}

class FileTree extends Tree {

    protected _onOpenBranch(isOpen: boolean): Promise<false | void> {
        return new Promise<false | void>((resolve, reject) => {
            if (isOpen)
                setTimeout(() => {
                    resolve();
                }, 2000);
            else
                resolve();
        });
    }

    protected _renderItem(): JSX.Element {
        return (
            <div style={{ color: 'white', lineHeight: '25px' }}
                onClick={(e) => {
                    showContextMenu({
                        position: { x: e.clientX, y: e.clientY },
                        items: [
                            [
                                { name: 'asd', callback: (e) => { console.log('asd'); } },
                                { name: 'asd2', callback: (e) => { console.log('asd2'); } },
                                { name: 'asd3', callback: (e) => { console.log('asd3'); } },
                            ],
                            [
                                { name: 'qwe', callback: (e) => { console.log('qwe'); } },
                                { name: 'qwe2', callback: (e) => { console.log('qwe2'); } },
                                { name: 'qwe3', callback: (e) => { console.log('qwe3'); } },
                            ],
                            [
                                { name: 'asd', callback: (e) => { console.log('asd'); } },
                                { name: 'asd2', callback: (e) => { console.log('asd2'); } },
                                { name: 'asd3', callback: (e) => { console.log('asd3'); } },
                            ],
                        ]
                    });
                }}
            >{this._name}</div>
        );
    }
}