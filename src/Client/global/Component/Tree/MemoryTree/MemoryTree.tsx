import { Tree } from '../Tree';
import { permanent_oSet } from '../../../Tools/PermanentVariable';

/**
 * 可记忆打开过的分支的树。
 * @param memorable 指示该树需要记忆打开过的分支。memorable的值作为保存记忆数据的唯一编号
 */
export abstract class MemoryTree<P extends { memorable: String }, D = any> extends Tree<P, D> {

    /**
     * 指示是否记忆打开过的分支
     */
    protected readonly _memorable: boolean = this._root._memorable !== undefined ? this._root._memorable : this.props.memorable !== undefined;

    constructor(props: any, context: any) {
        super(props, context);

        if (this._isRoot && this._memorable)
            (this as any)._openedBranch = permanent_oSet(`ui.MemoryTree.memory.${this.props.memorable}`);
    }
}