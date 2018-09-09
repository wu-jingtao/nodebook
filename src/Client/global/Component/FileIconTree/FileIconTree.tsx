import * as React from 'react';
import * as classnames from 'classnames';
import { oVar, ObservableVariable, ObservableSet } from 'observable-variable';

import { Tree } from '../Tree/Tree';
import { ObservableComponent } from '../../Tools/ObservableComponent';
import { FileIcon } from '../FileIcon/FileIcon';

const less = require('./FileIconTree.less');

/**
 * Tree 的基础上添加了文件图标，以及判断是否修改过
 */
export abstract class FileIconTree extends Tree {

    /**
     * 该文件是否被修改过
     */
    protected readonly _modified = oVar(false);

    protected _renderItem() {
        return <FileIconTreeItem
            modified={this._modified}
            openedBranch={this._data.subItem && this._openedBranch}
            name={this._name}
            fullNameString={this._fullNameString}
            isRootFolder={this.props.root === undefined} />;
    }
}

interface FileTreeItemPropsType {
    modified: ObservableVariable<boolean>;
    openedBranch?: ObservableSet<string>;
    name: string;
    fullNameString: string;
    isRootFolder?: boolean;
}

class FileIconTreeItem extends ObservableComponent<FileTreeItemPropsType> {

    componentDidMount() {
        this.watch(this.props.modified);
        if (this.props.openedBranch) this.watch(this.props.openedBranch);
    }

    render() {
        return (
            <>
                <FileIcon className={less.icon}
                    filename={this.props.name}
                    isFolder={this.props.openedBranch !== undefined}
                    opened={this.props.openedBranch && this.props.openedBranch.has(this.props.fullNameString)}
                    rootFolder={this.props.isRootFolder} />
                <div className={classnames(less.filename, { [less.modified]: this.props.modified.value })}>{this.props.name}</div>
            </>
        );
    }
}