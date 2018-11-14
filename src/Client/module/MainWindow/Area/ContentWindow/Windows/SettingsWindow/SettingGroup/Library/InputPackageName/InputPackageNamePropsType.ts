import { ObservableVariable, ObservableArray } from "observable-variable";

export interface InputPackageNamePropsType {
    /**
     * 类库的名称
     */
    name: ObservableVariable<string>;

    /**
     * 要显示的错误
     */
    errorTip: ObservableVariable<string>;

    /**
     * 已安装的类库列表
     */
    installedList: ObservableArray<{ name: string, version: string }>;
}