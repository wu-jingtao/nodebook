import { ObservableMap, ObservableSet } from "observable-variable";
import { Tree } from "./Tree";

export interface DataTree<T> {
    /**
     * 当前节点的名称。在兄弟节点当中应当是唯一的
     */
    name: string;

    /**
     * 用于保存一些额外数据
     */
    data: T;

    /**
     * 子项，如果存在则表示当前节点是一个分支
     */
    subItem?: ObservableMap<string, DataTree<T>>;
}

export interface TreePropsType<T> {
    /**
     * 数据树。只有子项需要
     */
    _dataTree?: DataTree<T>;

    /**
     * 树的根，只有子项需要
     */
    _root?: Tree;

    /**
     * 当前节点的父级，只有子项需要
     */
    _parent?: Tree;

    /**
     * 当前节点的名称。在兄弟节点当中应当是唯一的
     */
    name: string;
}