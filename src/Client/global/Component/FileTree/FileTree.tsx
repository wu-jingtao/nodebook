import * as React from 'react';
import * as classnames from 'classnames';
import { oVar, ObservableVariable } from 'observable-variable';

import { Tree } from '../Tree/Tree';
import { ObservableComponent } from '../../Tools/ObservableComponent';

const less = require('./FileTree.less');

/**
 * Tree 的基础上添加了文件图标
 */
export abstract class FileTree extends Tree {

    /**
     * 该文件是否被修改过
     */
    protected readonly _modified = oVar(false);

    _renderItem() {
        return <FileTreeItem modified={this._modified} name={this._name} />;
    }
}

class FileTreeItem extends ObservableComponent<{ modified: ObservableVariable<boolean>, name: string }> {

    componentDidMount() {
        this.watch(this.props.modified);
    }

    render() {
        return (
            <>
            
            </>
        );
    }
}