import * as React from 'react';
import { oMap } from 'observable-variable';

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { DataTree } from '../../../../../../../../global/Component/Tree/TreePropsType';
import { Tree } from '../../../../../../../../global/Component/Tree/Tree';
import { FileBrowserPropsType } from './FileBrowserPropsType';

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

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
        return parentProps;
    }

    protected _onOpenItem(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    protected _onOpenBranch(isOpen: boolean): Promise<false | void> {
        return new Promise<false | void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    protected _renderItem(): JSX.Element {
        return (
            <div style={{ color: 'white', lineHeight: '25px' }} >{this._name}</div>
        );
    }
}


/**
 * 

    private readonly _onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'copeMove';

        if (this._focusedItem.size > 0) {
            if (!this._focusedItem.has(this._fullName)) {
                this._focusedItem.clear();
                this._focusedItem.add(this._fullName);
            }
        } else
            this._focusedItem.add(this._fullName);

        let prompt: JQuery;
        if (this._focusedItem.size > 0)
            prompt = $(`<p>${this._focusedItem.size} item</p>`);
        else
            prompt = $(`<p>${this._name}</p>`);

        e.dataTransfer.setData('jsonPathArray', JSON.stringify(this._focusedItem));
        e.dataTransfer.setDragImage(prompt[0], 0, 0);
    };

    private readonly _onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (this._data.subItem) {
            e.preventDefault();
            e.stopPropagation();
            this._hoveredItem.value = this._fullName;
        }
    };

    private readonly _onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (this._data.subItem) {
            e.stopPropagation();
            console.log(this._fullName, e.dataTransfer.getData('jsonPathArray'));
        }
    };

 */