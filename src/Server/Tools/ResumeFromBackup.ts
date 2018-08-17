import * as fs from 'fs-extra';
import * as node_path from 'path';
import * as unzip from 'unzip';
import log from 'log-formatter';

import { FileManager } from '../module/FileManager/FileManager';

/**
 * 从指定的备份文件中恢复数据
 */

(async () => {
    const filename = process.argv[2];
    const path = node_path.join(FileManager._userDataBackupDir, filename);
    await fs.promises.access(path); //确保地址没有问题
    log.round('开始恢复备份', filename);

    await fs.remove(FileManager._userCodeDir);
    log.round('删除用户代码目录成功', FileManager._userCodeDir);

    await fs.remove(FileManager._recycleDir);
    log.round('删除回收站目录成功', FileManager._recycleDir);

    await fs.remove(FileManager._databaseDir);
    log.round('删除数据库目录成功', FileManager._databaseDir);

    await fs.remove(FileManager._libraryDir);
    await fs.remove(node_path.join(FileManager._userDataDir, 'package.json'));
    log.round('删除类库目录成功', FileManager._libraryDir);

    fs.createReadStream(path).pipe(unzip.Extract({ path: FileManager._userDataDir }))
        .on('error', log.error)
        .on('close', () => log.bold('恢复成功'));
})();