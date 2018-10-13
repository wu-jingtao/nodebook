/**
 * 调用其他任务暴露出来的方法
 * @param taskFilePath 任务文件的完整路径
 * @param functionName 任务暴露出的方法名称
 * @param data 要传递的数据
 */
export function invokeTask(taskFilePath: string, functionName: string, data: any): Promise<any>;

/**
 * 暴露一个方法供外界调用
 * @param functionName 方法名称
 * @param callback 要暴露的方法
 */
export function exportFunction(functionName: string, callback: (data: any) => Promise<any>): void;