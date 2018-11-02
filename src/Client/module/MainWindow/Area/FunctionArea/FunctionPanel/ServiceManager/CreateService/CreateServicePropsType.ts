import { ObservableVariable, ObservableMap, ObservableArray } from "observable-variable";

export interface CreateServicePropsType {
    /**
     * 服务的名称
     */
    name: ObservableVariable<string>;
    /**
     * 运行程序的绝对路径
     */
    filePath: ObservableVariable<string>;
    /**
     * 是否随系统重启
     */
    autoRestart: ObservableVariable<boolean>;
    /**
     * 崩溃时是否发送邮件提醒
     */
    reportError: ObservableVariable<boolean>;
    /**
     * 用于判断名称是否重复的子级树
     */
    subItems: ObservableMap<string, any>;
    /**
     * 如果用户输入的名称不合法，需要显示的错误提示
     */
    errorTip: ObservableArray<string>;
    /**
     * 是否是修改服务
     */
    isModify?: boolean;
}