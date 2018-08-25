async function Ajax(method: string, url: string, args: any): Promise<any> {
    $.ajax({
        method,
        error() { },
        success() { }
    });
}

/**
 * 发送 Get请求
 */
export async function Get(url: string, args: any): Promise<any> {

}