import { ObservableVariable, ObservableMap, ObservableArray } from "observable-variable";

export interface InputShortcutNamePropsType {
    /**
     * 用户输入的快捷方式名称
     */
    name: ObservableVariable<string>;
    /**
     * 文件的文件路径
     */
    filePath: ObservableVariable<string>;
    /**
     * 用于判断名称是否重复的子级树
     */
    subItems: ObservableMap<string, any>;
    /**
     * 如果用户输入的名称不合法，需要显示的错误提示
     */
    errorTip: ObservableArray<string>;
    /**
     * 新建的是否是目录
     */
    isDirectory?: boolean;
    /**
     * 是否是重命名
     */
    isRename?: boolean;
}