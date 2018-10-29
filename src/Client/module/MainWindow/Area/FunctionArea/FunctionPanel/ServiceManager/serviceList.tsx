import { oMap, ObservableVariable } from "observable-variable";

/**
 * 服务列表。key是运行文件的绝对路径
 */
export const serviceList = oMap<string, ObservableVariable<{ name: string, auto_restart: boolean, report_error: boolean }>>([]);