/**
 * 由于 pidusage 库的 ts 类型定义过旧，先暂时使用该文件中定义的类型，等微软更新后可将该文件删除
 */

import * as pidusage_o from 'pidusage';

interface pidusage_type {
    (pids: number | number[] | string | string[], callback: (err: Error | null, stats: pidusage_Stat) => void): void;
    (pids: number | number[] | string | string[]): Promise<pidusage_Stat>;
}

export interface pidusage_Stat {
    /**
       * percentage (from 0 to 100*vcore)
       */
    cpu: number;

    /**
     * bytes
     */
    memory: number;

    /**
     * PPID
     */
    ppid: number;

    /**
     * PID
     */
    pid: number;

    /**
     * ms user + system time
     */
    ctime: number;

    /**
     * ms since the start of the process
     */
    elapsed: number;

    /**
     * ms since epoch
     */
    timestamp: number;
}

export const pidusage: pidusage_type = pidusage_o as any;
