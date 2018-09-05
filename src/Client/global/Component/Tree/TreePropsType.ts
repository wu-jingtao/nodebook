import { ObservableMap } from "observable-variable";
import { Tree } from "./Tree";

export interface DataTree {
    /**
     * 当前节点的名称。在兄弟节点当中应当是唯一的
     */
    name: string;

    /**
     * 用于保存一些额外数据
     */
    data?: any;

    /**
     * 子项，如果存在则表示当前节点是一个分支
     */
    subItem?: ObservableMap<string, DataTree>;
}

export interface TreePropsType {
    /**
     * 该树的唯一身份标识。只有根需要
     */
    uniqueID?: string;

    /**
     * 数据树。只有根需要
     */
    dataTree?: DataTree;

    /**
     * 树的根，只有子项需要
     */
    root?: Tree;

    /**
     * 从根到当前节点的完整名称。在兄弟节点当中应当是唯一的
     */
    fullName: string[];
}