/**
 * 浏览器端一些有用的帮助方法
 */
window.nodebook = {
    /**
     * 客户端调用服务器端任务暴露出来的方法
     * @param {string} taskFilePath 任务文件的完整路径
     * @param {string} functionName 任务暴露出的方法名称
     * @param {any} data 要传递的数据
     */
    invokeTask(taskFilePath, functionName, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/task/invokeTaskFunction',
                type: 'POST',
                dataType: 'json',
                cache: false,
                timeout: 1000 * 60 * 2,
                data: {
                    path: taskFilePath,
                    function: functionName,
                    json: JSON.stringify(data)
                },
                error(jqXHR) {
                    const err = new Error(jqXHR.responseText);
                    err.statusCode = jqXHR.status;
                    reject(err);
                },
                success(data) {
                    data.error !== undefined ? reject(new Error(data.error)) : resolve(data.data);
                }
            });
        });
    }
};