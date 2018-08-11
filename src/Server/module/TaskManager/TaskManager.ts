import * as os from 'os';
import * as child_process from 'child_process';
import * as pidusage from 'pidusage';
import * as _ from 'lodash';
import { BaseServiceModule } from "service-starter";

import { LogManager } from "./LogManager/LogManager";
import { FileManager } from "../FileManager/FileManager";

/**
 * 用户任务管理器
 */
export class TaskManager extends BaseServiceModule {

    //存放正在执行的任务。key：文件路径。invokeCallback：调用任务内部方法回调，key：随机ID
    private readonly _taskList: Map<string, { process: child_process.ChildProcess, invokeCallback: Map<string, (jsonResult: string) => void> }> = new Map();
    private _logManager: LogManager;

    async onStart(): Promise<void> {
        this._logManager = this.services.LogManager;
    }

    /**
     * 创建一个新的任务。如果任务正在运行，则不执行任何操作
     */
    createTask(taskFilePath: string): void {
        if (!taskFilePath.startsWith(FileManager._userCodeDir))
            throw new Error(`不能为 '${FileManager._userCodeDir}' 目录外的文件创建任务`);

        if (!taskFilePath.endsWith('.js'))
            throw new Error('只能为 js 类型的文件创建任务');

        if (!this._taskList.has(taskFilePath)) {    //确保要创建的任务并未处于运行状态
            const child = child_process.fork(taskFilePath, [], {
                cwd: FileManager._programDataDir,
                uid: 6000,
                gid: 6000
            });

            const logger = this._logManager.createTaskLogger(taskFilePath);

            logger.status.value = 'running';

            child.stdout.on('data', chunk => logger.addLog(false, chunk.toString()));
            child.stderr.on('data', chunk => logger.addLog(true, chunk.toString()));

            child.on('close', (code, signal) => {
                logger.status.value = code === 0 || signal === 'SIGTERM' ? 'stop' : 'crashed';
                this._taskList.delete(taskFilePath);
            });

            const invokeCallback: Map<string, (jsonResult: string) => void> = new Map();

            child.on('message', (msg: { requestID: string, jsonResult: string }) => {
                if (_.isObject(msg)) {
                    const callback = invokeCallback.get(msg.requestID);
                    if (callback) {
                        invokeCallback.delete(msg.requestID);
                        callback(msg.jsonResult);
                    }
                }
            });

            this._taskList.set(taskFilePath, { process: child, invokeCallback });
        }
    }

    /**
     * 删除某个正在运行的任务，如果任务不存在，则不执行任何操作
     */
    destroyTask(taskFilePath: string): void {
        const task = this._taskList.get(taskFilePath);
        if (task) task.process.kill();
    }

    /**
     * 获取某个正在运行的任务，资源消耗的情况，如果任务不存在则返回空
     */
    async getTaskResourcesConsumption(taskFilePath: string): Promise<pidusage.Stat | undefined> {
        const task = this._taskList.get(taskFilePath);
        if (task) return await pidusage(task.process.pid);
    }

    /**
     * 获取计算机的硬件信息
     */
    getSystemHardwareInfo() {
        const cpu = os.cpus();

        return {
            cpuNumber: cpu.length,
            cpuName: cpu[0].model,
            domain: process.env.DOMAIN,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            uptime: os.uptime() //系统运行了多久了
        };
    }

    /**
     * 调用任务中暴露出的方法。执行后的结果以json格式返回。如果60秒没有返回结果这判定超时
     * @param taskFilePath 任务文件路径
     * @param functionName 要调用的方法名称
     * @param jsonArgs json参数，到达任务进程中后会自动反序列化，然后传给要调用的方法
     */
    invokeTaskFunction(taskFilePath: string, functionName: string, jsonArgs: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const task = this._taskList.get(taskFilePath);
            if (task && task.process.connected) {
                const requestID = Math.random().toString();

                const timer = setTimeout(() => {
                    task.invokeCallback.delete(requestID);
                    reject(new Error('调用超时'));
                }, 1000 * 60);

                task.invokeCallback.set(requestID, jsonResult => {
                    task.invokeCallback.delete(requestID);
                    clearTimeout(timer);
                    resolve(jsonResult);
                });

                task.process.send({ requestID, functionName, jsonArgs });
            } else
                reject(new Error('要调用的任务的方法无法访问'));
        });
    }
}