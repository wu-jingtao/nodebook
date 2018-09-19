import { Tree } from '../Tree';
import { permanent_oSet } from '../../../Tools/PermanentVariable';
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