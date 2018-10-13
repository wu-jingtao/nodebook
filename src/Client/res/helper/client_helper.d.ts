/**
 * 浏览器端帮助方法
 */
declare namespace nodebook {
    /**
     * 调用服务器端任务暴露出来的方法
     * @param taskFilePath 任务文件的完整路径
     * @param functionName 任务暴露出的方法名称
     * @param data 要传递的数据
     */
    export function invokeTask(taskFilePath: string, functionName: string, data: any): Promise<any>;
}