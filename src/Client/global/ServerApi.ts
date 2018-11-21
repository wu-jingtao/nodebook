import { ObservableVariable } from 'observable-variable';
import { Stat } from 'pidusage';
import { DiskUsage } from 'diskusage';
import md5 = require('blueimp-md5');

import { Get, Post } from './Tools/Ajax';
import { ServiceConfig } from '../../Server/module/Database/ServicesTable';

/**
 * 服务器端接口
 */
export const ServerApi = {
    others: {
        /**
         * 重启服务器
         * @param password 用户密码
         */
        async restart(password: string): Promise<void> {
            expect(await Post('/others/restart', { password: md5(password) }), 'ok', '重启服务器失败');
        },
        /**
         * 向用户返回他自己的ip
         */
        async getIP(): Promise<string> {
            return await Get('/others/getIP');
        },
        /**
         * 重新生成openssl证书
         */
        async regenerateCert(password: string): Promise<void> {
            expect(await Post('/others/regenerateCert', { password: md5(password) }), 'ok', '重新生成openssl证书失败');
        },
        /**
         * 发送测试邮件，用于检测邮箱设置是否正确
         */
        async sendTestMail(): Promise<void> {
            expect(await Get('/others/sendTestMail'), 'ok', '发送测试邮件失败');
        },
    },
    /**
     * 用户相关操作
     */
    user: {
        /**
         * 登陆
         */
        async login(username: string, password: string): Promise<void> {
            expect(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(username), true, '传入的电子邮箱格式不正确');
            expect(await Post('/user/login', { name: username, pass: md5(password) }), 'ok', '登陆失败');
        },
        /**
         * 更新用户令牌
         */
        async updateToken(): Promise<void> {
            expect(await Get('/user/update_token'), 'ok', '更新用户令牌失败，请重新登陆');
        },
    },
    /**
     * 系统设置
     */
    settings: {
        /**
         * 获取所有普通设置项
         */
        async getAllNormalKey(): Promise<ReadonlyArray<{ key: string, value: any }>> {
            return JSON.parse(await Get('/setting/getAllNormalKey'));
        },
        /**
         * 获取所有私密设置。除了密码
         */
        async getAllSecretKey(): Promise<ReadonlyArray<{ key: string, value: any }>> {
            return JSON.parse(await Get('/setting/getAllSecretKey'));
        },
        /**
         * 更改普通设置项
         */
        async changeNormalSetting(key: string, value: any): Promise<void> {
            expect(await Post('/setting/changeNormalSetting', { key, value }), 'ok', '更改普通设置项失败');
        },
        /**
         * 更改私密设置项
         */
        async changeSecretSetting(key: string, value: any, password: string): Promise<void> {
            expect(await Post('/setting/changeSecretSetting', { key, value, password: md5(password) }), 'ok', '更改私密设置项失败');
        },
    },
    /**
     * 文件操作
     */
    file: {
        /**
         * 读取服务器端文件数据
         * @param path 传入的路径需对应服务器端全路径
         */
        async readFile(path: string): Promise<any> {
            return await Get('/file/api/readFile', { path }, true);
        },
        /**
         * 查询某个单独的文件的状态信息
         * @param path 
         */
        async fileStatus(path: string): Promise<{ isBinary: boolean, modifyTime: number, size: number }> {
            return JSON.parse(await Post('/file/api/fileStatus', { path }));
        },
        /**
         * 列出某个目录中的子目录与文件
         * @param path 
         */
        async listDirectory(path: string): Promise<ReadonlyArray<{ name: string, isFile: boolean, isBinary: boolean, modifyTime: number, size: number }>> {
            return JSON.parse(await Post('/file/api/listDirectory', { path }));
        },
        /**
         * 创建目录
         * @param path
         */
        async createDirectory(path: string): Promise<void> {
            expect(await Post('/file/api/createDirectory', { path }), 'ok', '创建目录失败');
        },
        /**
         * 复制文件或整个目录
         * @param from
         * @param to
         */
        async copy(from: string, to: string): Promise<void> {
            expect(await Post('/file/api/copy', { from, to }), 'ok', '复制文件失败');
        },
        /**
         * 移动文件或整个目录
         * @param from
         * @param to
         */
        async move(from: string, to: string): Promise<void> {
            expect(await Post('/file/api/move', { from, to }), 'ok', '移动文件失败');
        },
        /**
         * 上传文件。新建文件、修改文件也是用这个
         * @param file
         * @param to
         */
        uploadFile(file: Blob, to: string, progress?: ObservableVariable<number>) {
            const promise = Post('/file/api/uploadFile', { to }, file, progress);
            const result: typeof promise = promise.then(e => expect(e, 'ok', '上传文件失败')) as any;
            result.abort = promise.abort;
            return result;
        },
        /**
         * 删除 '_userCodeDir' 下的文件或目录
         * @param path
         */
        async deleteCodeData(path: string): Promise<void> {
            expect(await Post('/file/api/deleteCodeData', { path }), 'ok', '删除失败');
        },
        /**
         * 删除 '_programDataDir' 下的文件或目录
         * @param path
         */
        async deleteProgramData(path: string): Promise<void> {
            expect(await Post('/file/api/deleteProgramData', { path }), 'ok', '删除失败');
        },
        /**
         * 删除 '_recycleDir' 下的文件或目录
         * @param path
         */
        async deleteRecycleData(path: string): Promise<void> {
            expect(await Post('/file/api/deleteRecycleData', { path }), 'ok', '删除失败');
        },
        /**
         * 清空回收站
         */
        async cleanRecycle(): Promise<void> {
            expect(await Post('/file/api/cleanRecycle'), 'ok', '清空回收站失败');
        },
        /**
         * 压缩某个文件或目录
         * @param path
         * @param to
         */
        async zipData(path: string, to: string): Promise<void> {
            if (!to.endsWith('.zip'))
                throw new Error("压缩文件的后缀名必须以'zip'结尾");

            expect(await Post('/file/api/zipData', { path, to }), 'ok', '压缩失败');
        },
        /**
         * 解压压缩文件
         * @param path
         * @param to
         */
        async unzipData(path: string, to: string): Promise<void> {
            if (!path.endsWith('.zip'))
                throw new Error("压缩文件的后缀名必须以'zip'结尾");

            expect(await Post('/file/api/unzipData', { path, to }), 'ok', '解压失败');
        },
    },
    /**
     * 任务相关操作
     */
    task: {
        /**
         * 清空某个任务的日志
         * @param path 任务文件的完整路径
         */
        async cleanTaskLogger(path: string): Promise<void> {
            expect(await Post('/task/cleanTaskLogger', { path }), 'ok', '清空任务日志失败');
        },
        /**
         * 获取某个任务在某个时间点之后的所有日志
         * @param date 数字形式。不传入则表示获取所有日志
         */
        async getLogsAfterDate(path: string, date?: number): Promise<ReadonlyArray<{ date: number, text: string }>> {
            return JSON.parse(await Post('/task/getLogsAfterDate', { path, date }));
        },
        /**
         * 从末尾获取多少条日志
         * @param size 要获取的条数
         */
        async getLogsFromEnd(path: string, size: number): Promise<ReadonlyArray<{ date: number, text: string }>> {
            return JSON.parse(await Post('/task/getLogsFromEnd', { path, size }));
        },
        /**
         * 获取某个任务当前的运行状态
         */
        async getTaskStatus(path: string): Promise<'running' | 'debugging' | 'stop' | 'crashed' | null> {
            return (await Post('/task/getTaskStatus', { path }) as any) || 'null';
        },
        /**
         * 获取所有任务的状态
         */
        async getAllTaskStatus(): Promise<ReadonlyArray<{ path: string, status: 'running' | 'debugging' | 'stop' | 'crashed' }>> {
            return JSON.parse(await Get('/task/getAllTaskStatus'));
        },
        /**
         * 创建一个新的任务
         * @param debug 是否启动调试模式
         * @returns 返回调试的端口号。-1表示无法调试
         */
        async createTask(path: string, debug?: boolean): Promise<number> {
            return Number.parseInt(await Post('/task/createTask', { path, debug }));
        },
        /**
         * 终止某个正在运行的任务
         */
        async destroyTask(path: string): Promise<void> {
            expect(await Post('/task/destroyTask', { path }), 'ok', '终止任务失败');
        },
        /**
         * 获取某个正在运行的任务，资源消耗的情况
         */
        async getTaskResourcesConsumption(path: string): Promise<Stat | null> {
            return JSON.parse(await Post('/task/getTaskResourcesConsumption', { path }) || 'null');
        },
        /**
         * 获取计算机的硬件信息
         */
        async getSystemHardwareInfo(): Promise<{
            cpuNumber: number, cpuName: string, cpuUsage: number,
            uptime: number, totalMemory: number, freeMemory: number,
            userDataDir: DiskUsage, programDataDir: DiskUsage
        }> {
            return JSON.parse(await Get('/task/getSystemHardwareInfo'));
        },
        /**
         * 调用任务中暴露出的方法
         * @param path 任务文件的完整路径
         * @param functionName 要调用的方法名称
         * @param jsonData 要传递的JSON数据
         */
        async invokeTaskFunction(path: string, functionName: string, jsonData: string): Promise<any> {
            const data = JSON.parse(await Post('/task/invokeTaskFunction', { path, function: functionName, json: jsonData }));

            if (data.data)
                return data.data;
            else
                throw data.error ? new Error(data.error) : new Error('调用失败')
        },
        /**
         * 获取服务列表
         */
        async getServicesList(): Promise<ReadonlyArray<ServiceConfig>> {
            return JSON.parse(await Get('/task/getServicesList'));
        },
        /**
         * 创建一个新的服务
         * @param path 服务文件的完整路径
         * @param name 服务的名称
         * @param auto_restart 是否随系统重启
         * @param report_error 崩溃时是否发送邮件报告错误
         */
        async createService(path: string, name: string, auto_restart: boolean, report_error: boolean): Promise<void> {
            expect(await Post('/task/createService', { path, name, auto_restart, report_error }), 'ok', '创建服务失败');
        },
        /**
         * 更新某个服务的配置
         */
        async updateService(path: string, name: string, auto_restart: boolean, report_error: boolean): Promise<void> {
            expect(await Post('/task/updateService', { path, name, auto_restart, report_error }), 'ok', '更新服务失败');
        },
        /**
         * 删除某个服务
         */
        async deleteService(path: string): Promise<void> {
            expect(await Post('/task/deleteService', { path }), 'ok', '删除服务失败');
        },
    },
    /**
     * 系统图标
     */
    logo: {
        /**
         * 修改登录页图片
         */
        async changeLoginBrand(file: File): Promise<void> {
            expect(await Post('/logo/change', { filename: 'brand.png' }, file), 'ok', '修改登录页图片失败');
        },
        /**
         * 修改侧边栏图标
         */
        async changeSidebarLogo(file: File): Promise<void> {
            expect(await Post('/logo/change', { filename: 'icon.png' }, file), 'ok', '修改侧边栏图标失败');
        },
        /**
         * 修改浏览器小图标
         */
        async changeFavicon(file: File): Promise<void> {
            expect(await Post('/logo/change', { filename: 'favicon.ico' }, file), 'ok', '修改浏览器小图标失败');
        },
        /**
         * 重置系统图标
         */
        async resetLogo(): Promise<void> {
            expect(await Post('/logo/reset'), 'ok', '重置系统图标失败');
        },
    },
    /**
     * 数据备份
     */
    backup: {
        /**
         * 将某个备份文件发送到用户邮箱
         */
        async sendBackupEmail(filename: string): Promise<void> {
            expect(await Post('/backup/sendBackupEmail', { filename }), 'ok', `将备份文件 (${filename}) 发送到用户邮箱失败`);
        },
        /**
         * 列出所有备份文件的文件名
         */
        async listBackupFiles(): Promise<string[]> {
            return JSON.parse(await Get('/backup/listBackupFiles'));
        },
        /**
         * 删除某个备份文件
         */
        async deleteBackupFiles(filename: string): Promise<void> {
            expect(await Post('/backup/deleteBackupFiles', { filename }), 'ok', `删除备份文件 (${filename}) 失败`);
        },
        /**
         * 创建一个新的备份
         */
        async createBackupFile(): Promise<string> {
            return await Get('/backup/createBackupFile');
        },
        /**
         * 从备份文件中恢复数据
         */
        async resumeFromBackup(filename: string, password: string): Promise<void> {
            expect(await Post('/backup/resumeFromBackup', { filename, password: md5(password) }), 'ok', `从备份文件 (${filename}) 恢复数据失败`);
        },
    },
    /**
     * 类库操作
     */
    library: {
        /**
         * 获取安装了的类库列表
         */
        async getInstalledLibraries(): Promise<{ name: string, version: string }[]> {
            return JSON.parse(await Get('/library/getInstalledLibraries'));
        },
        /**
         * 安装类库
         * @param name npm包名称
         */
        async installLibrary(name: string): Promise<void> {
            expect(await Post('/library/installLibrary', { name }), 'ok', `安装类库 (${name}) 失败`);
        },
        /**
         * 卸载类库
         */
        async uninstallLibrary(name: string): Promise<void> {
            expect(await Post('/library/uninstallLibrary', { name }), 'ok', `卸载类库 (${name}) 失败`);
        },
        /**
         * 更新某个类库
         */
        async updateLibrary(name: string): Promise<void> {
            expect(await Post('/library/updateLibrary', { name }), 'ok', `更新类库 (${name}) 失败`);
        },
    }
};

//断言
function expect(expect: any, tobe: any, exceptionMessage: string) {
    if (expect !== tobe) throw new Error(exceptionMessage);
}