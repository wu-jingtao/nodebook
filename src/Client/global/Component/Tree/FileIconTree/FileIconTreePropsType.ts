import { ObservableSet } from "observable-variable";
import { MemoryTreePropsType } from "../MemoryTree/MemoryTreePropsType";

export interface FileIconTreePropsType extends MemoryTreePropsType {
    /**
     * 修改了还未保存的文件列表。value 是 _fullNameString
     */
    modifiedFiles: ObservableSet<string>;   
}