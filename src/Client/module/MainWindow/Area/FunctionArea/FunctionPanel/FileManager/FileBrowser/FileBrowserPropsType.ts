import { FoldableContainerPropsType } from "../FoldableContainer/FoldableContainerPropsType";
import { ObservableVariable } from "observable-variable";

export interface FileBrowserPropsType extends FoldableContainerPropsType {
    /**
     * 是否可滚动
     */
    scrollable?: boolean;
}