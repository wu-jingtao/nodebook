import { permanent_oSet } from 'observable-variable';

import { Tree } from '../Tree';
import { MemoryTreePropsType } from './MemoryTreePropsType';

/**
 * 可记忆打开过的分支的树。
 */
export abstract class MemoryTree<P extends MemoryTreePropsType, D = any> extends Tree<P, D> {

    constructor(props: any, context: any) {
        super(props, context);

        if (this._isRoot && this.props.memorable !== undefined)
            (this._openedBranch as any) = permanent_oSet(`ui.MemoryTree.${this.props.memorable}`);
    }
}