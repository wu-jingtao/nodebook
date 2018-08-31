import { ObservableVariable } from "observable-variable";

import { fileManagerNumber, serviceManagerErrorNumber } from "../SideBar/SideBarPropsType";

/**
 * 确定显示哪一种功能区
 * 'file'：     文件列表，资源管理器
 * 'task'：     任务管理器
 * 'service'：  服务列表
 * 'shortcut'： 快捷方式
 *  undefined： 不显示功能区
 */
export type DisplayType = ObservableVariable<'file' | 'task' | 'shortcut' | 'service' | undefined>;

/**
 * 功能区需要的属性
 */
export type FunctionAreaPropsType = {
    functionAreaDisplayType: DisplayType,
    fileManagerNumber: fileManagerNumber,
    serviceManagerErrorNumber: serviceManagerErrorNumber
};