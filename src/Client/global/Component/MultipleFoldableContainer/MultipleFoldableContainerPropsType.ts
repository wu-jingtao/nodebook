import { ObservableVariable } from "observable-variable";

import { FoldableContainerPropsType } from "../FoldableContainer/FoldableContainerPropsType";

export interface MultipleFoldableContainerPropsType {
    /**
     * 标识该折叠框的唯一ID
     */
    uniqueID: string;

    /**
     * 当可分配的空间不足是是否优先照顾排在上面的容器，默认false
     */
    topFirst?: boolean;

    className?: string;
}

export interface MultipleFoldableContainerItemPropsType extends FoldableContainerPropsType {
    /**
     * 容器的高度
     */
    _height?: ObservableVariable<number>;
}

export interface MultipleFoldableContainerSplitterPropsType {
    /**
     * 对应的容器是否处于折叠状态。
     */
    folded: ObservableVariable<boolean>;

    /**
     * 对应容器的编号
     */
    index: number;

    /**
     * 计算高度
     * @param splitterIndex 对应容器的编号
     * @param position 鼠标的位置
     */
    changeHeight: (splitterIndex: number, position: number) => void;
}