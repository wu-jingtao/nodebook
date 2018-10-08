import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableSet, oVar } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../Tools/ObservableComponent';
import { FileIcon } from '../../FileIcon/FileIcon';
import { MemoryTree } from '../MemoryTree/MemoryTree';
import { FileIconTreePropsType } from './FileIconTreePropsType';

const less = require('./FileIconTree.less');

/**
 * MemoryTree 的基础上添加了文件图标，以及判断是否修改过
 */
export abstract class FileIconTree<P extends FileIconTreePropsType, D = any> extends MemoryTree<P, D> {

    /**
     * 判断文件是否被修改过value是_fullNameString
     */
    protected readonly _modifiedFiles: ObservableSet<string> = this.props.modifiedFiles || this._root._modifiedFiles;

    /**
     * 在文件路径后面要显示的内容
     */
    protected readonly _stateInfoContent = oVar<JSX.Element | undefined>(undefined);

    /**
     * 渲染FileIconTree的内容
     */
    private _FileIconTree_render = () => {
        let modified = false;

        for (const item of this._modifiedFiles.values()) {
            if (item.startsWith(this._fullNameString)) {
                modified = true;
                break;
            }
        }

        return (
            <div className={less.FileIconTree}>
                <FileIcon
                    className={less.icon}
                    filename={this._name}
                    isFolder={this._isBranch}
                    opened={this._isBranch && this._openedBranch.has(this._fullNameString)}
                    rootFolder={this._isRoot} />
                <div className={classnames(less.filename, { [less.modified]: modified })}> {this._name}</div>
                <div className={less.stateInfoContent}>{this._stateInfoContent.value}</div>
            </div>
        );
    };

    protected _renderItem() {
        const watch = [this._modifiedFiles, this._stateInfoContent];

        if (this._isBranch) watch.push(this._openedBranch);

        return <ObservableComponentWrapper watch={watch} render={this._FileIconTree_render} />
    }
}