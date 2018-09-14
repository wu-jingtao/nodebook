import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, ObservableArray, oArr } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../Tools/ObservableComponent';
import { FileIcon } from '../../FileIcon/FileIcon';
import { MemoryTree } from '../MemoryTree/MemoryTree';

const less = require('./FileIconTree.less');

/**
 * MemoryTree 的基础上添加了文件图标，以及判断是否修改过
 */
export abstract class FileIconTree<P extends { memorable?: string }, D = any> extends MemoryTree<P, D> {

    /**
     * 该文件是否被修改过value是_fullNameString
     */
    protected readonly _modified: ObservableArray<string> = this._root._modified || oArr([]);

    /**
     * 渲染FileIconTree的内容
     */
    private _FileIconTree_render = () => {
        return (
            <>
                <FileIcon
                    className={less.icon}
                    filename={this._name}
                    isFolder={this._dataTree.subItem !== undefined}
                    opened={this._dataTree.subItem && this._openedBranch.has(this._fullNameString)}
                    rootFolder={this._isRoot} />
                <div className={classnames(less.filename, { [less.modified]: this._modified.some(item => item.startsWith(this._fullNameString)) })}>{this._name}</div>
            </>
        );
    };

    protected _renderItem() {
        const watch: ObservableVariable<any>[] = [this._modified];
        if (this._dataTree.subItem) watch.push(this._openedBranch);

        return <ObservableComponentWrapper watch={watch} render={this._FileIconTree_render} />
    }
}