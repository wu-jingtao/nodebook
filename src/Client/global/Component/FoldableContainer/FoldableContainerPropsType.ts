import { ObservableVariable } from "observable-variable";

export interface FoldableContainerPropsType {
    /**
     * 标题
     */
    title: string;

    /**
     * 标识该折叠框的唯一ID
     */
    uniqueID: string;

    /**
     * 是否处于折叠状态
     */
    folded?: ObservableVariable<boolean>;

    /**
     * 不允许折叠
     */
    noFold?: boolean;
}