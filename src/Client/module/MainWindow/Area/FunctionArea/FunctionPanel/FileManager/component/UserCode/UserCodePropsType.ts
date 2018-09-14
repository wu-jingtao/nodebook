import { FoldableContainerPropsType } from "../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType";
import { EditableFileTreePropsType } from "../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTreePropsType";
import { fileManagerNumber } from "../../../../../SideBar/SideBarPropsType";
import { contentWindows } from "../../../../../ContentWindow/ContentWindowPropsType";

export interface UserCodePropsType extends FoldableContainerPropsType {
    fileManagerNumber: fileManagerNumber,
    contentWindows: contentWindows
}

export interface UserCodeTreePropsType extends EditableFileTreePropsType {
    fileManagerNumber: fileManagerNumber,
    contentWindows: contentWindows
}