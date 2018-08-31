import { ObservableVariable } from "observable-variable";

import { DisplayType } from "../FunctionArea/FunctionAreaPropsType";
import { showLogWindow } from "../LogWindow/LogWindowPropsType";
import { openedWindows } from "../ContentWindow/ContentWindowPropsType";

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
    functionAreaDisplayType: DisplayType,
    showLogWindow: showLogWindow,
    openedWindows: openedWindows,
    fileManagerNumber: fileManagerNumber,
    serviceManagerErrorNumber: serviceManagerErrorNumber
};