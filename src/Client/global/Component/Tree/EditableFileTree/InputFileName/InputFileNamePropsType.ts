import { ObservableVariable, ObservableMap } from "observable-variable";

export interface InputFileNamePropsType {
    /**
     * 用户输入的文件名称
     */
    name: ObservableVariable<string>;
    /**
     * 用于判断文件名是否重复的子级树
     */
    subItems: ObservableMap<string, any>;
    /**
     * 如果用户输入的文件名不合法，需要显示的错误提示
     */
    errorTip: ObservableVariable<string>;
    /**
     * 新建的是否是目录
     */
    isDirectory?: boolean;
    /**
     * 是否是重命名
     */
    isRename?: boolean;
    /**
     * 额外的验证条件
     */
    extraValidation?: (name: string) => string
}