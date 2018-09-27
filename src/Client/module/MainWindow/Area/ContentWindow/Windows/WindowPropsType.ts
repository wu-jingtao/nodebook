import { ObservableVariable } from "observable-variable";

export interface WindowPropsType {
    /**
     * 窗口的名称
     */
    name: string;
    
    /**
     * 窗口标题栏要显示的内容
     */
    title: ObservableVariable<JSX.Element>;

    /**
     * 窗口的功能按钮组
     */
    functionButtons: ObservableVariable<JSX.Element>;

    /**
     * 用户创建窗口时传递的参数
     */
    args: { [key: string]: any };
}