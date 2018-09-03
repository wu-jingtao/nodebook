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
     * 默认是否处于折叠状态，默认false
     */
    folded?: boolean;

    /**
     * 不允许折叠
     */
    noFold?: boolean;
}