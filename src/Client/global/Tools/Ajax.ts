/**
 * 包装jquery的 Ajax 方法 
 */
function Ajax(method: 'GET' | 'POST', url: string, data: any, setting: JQuery.AjaxSettings = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            url,
            type: method,
            data,
            cache: false,
            timeout: 1000 * 60 * 2,
            error(jqXHR, textStatus, errorThrown) {
                debugger
            },
            success(data, textStatus, jqXHR) {
                debugger
            },
            ...setting
        });
    });
}

/**
 * 发送 Get请求
 */
export async function Get(url: string, data?: any): Promise<any> {
    return await Ajax('GET', url, data);
}

/**
 * 发送 Post请求
 */
export async function Post(url: string, data?: any, files?: File[]): Promise<any> {
    if (files) {
        const formData = new FormData();
        jQuery.each(data, (key: string, value) => formData.append(key, value));
        files.forEach(item => formData.append('files[]', item, item.name));
        return await Ajax('POST', url, formData, { processData: false, contentType: false });
    } else {
        return await Ajax('POST', url, data);
    }
}