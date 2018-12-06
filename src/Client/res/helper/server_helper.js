/**
 * 导出的方法列表
 */
const exportFunctionList = new Map();

/**
 * 回调列表
 */
const callbackList = new Map();

process.on('message', msg => {
    try {
        if (msg.type === 'request') {
            const { functionName, data } = msg.requestData;
            const func = exportFunctionList.get(functionName);

            if (func) {
                func(JSON.parse(data || 'null'))
                    .then(data => {
                        process.send({
                            type: 'response', id: msg.id,
                            responseData: JSON.stringify({ data })
                        });
                    })
                    .catch(err => {
                        process.send({
                            type: 'response', id: msg.id,
                            responseData: `{"error":"${err.message || err}"}`
                        });
                    });
            } else {
                process.send({
                    type: 'response', id: msg.id,
                    responseData: `{"error":"调用的方法'${functionName}'不存在"}`
                });
            }
        } else if (msg.type === 'response') {
            const callback = callbackList.get(msg.id);
            if (callback) {
                callbackList.delete(msg.id);
                callback(JSON.parse(msg.responseData || 'null'));
            }
        }
    } catch (error) {
        console.log('接收到的消息类型错误', error);
    }
});

/**
 * 调用其他任务暴露出来的方法
 * @param {string} taskFilePath 任务文件的完整路径
 * @param {string} functionName 任务暴露出的方法名称
 * @param {any} data 要传递的数据
 */
exports.invokeTask = (taskFilePath, functionName, data) => {
    return new Promise((resolve, reject) => {
        const id = Math.random().toString();

        //发送数据
        process.send({
            type: 'request', id,
            requestData: {
                taskFilePath,
                functionName,
                data: JSON.stringify(data)
            }
        });

        //调用超时
        const timer = setTimeout(() => {
            callbackList.delete(id);
            reject(new Error('调用超时'));
        }, 1000 * 100);

        //注册回调
        callbackList.set(id, data => {
            clearTimeout(timer);

            if (data.data)
                resolve(data.data);
            else
                reject(data.error ? new Error(data.error) : new Error('调用失败'));
        });
    });
};

/**
 * 暴露一个方法供外界调用
 * @param {string} functionName 方法名称
 * @param {(data:any)=>Promise<any>} callback 要导出的方法
 */
exports.exportFunction = (functionName, callback) => {
    exportFunctionList.set(functionName, callback);
}