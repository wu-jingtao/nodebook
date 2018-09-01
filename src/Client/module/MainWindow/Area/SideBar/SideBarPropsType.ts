import { ObservableVariable } from "observable-variable";

import { functionAreaDisplayType } from "../FunctionArea/FunctionAreaPropsType";
import { showLogWindow } from "../LogWindow/LogWindowPropsType";
import { contentWindows } from "../ContentWindow/ContentWindowPropsType";

/**
 * 侧边栏，资源管理器图标上要显示的数字，蓝色
 */
export type fileManagerNumber = ObservableVariable<number>;

/**
 * 侧边栏，服务管理器图标上要显示的数字，红色
 */
export type serviceManagerErrorNumber = ObservableVariable<number>;

/**
 * 侧边栏需要的属性
 */
export type SideBarPropsType = {
    functionAreaDisplayType: functionAreaDisplayType,
    showLogWindow: showLogWindow,
    contentWindows: contentWindows,
    fileManagerNumber: fileManagerNumber,
    serviceManagerErrorNumber: serviceManagerErrorNumber
};