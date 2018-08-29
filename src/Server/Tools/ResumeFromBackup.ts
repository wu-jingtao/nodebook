import * as fs from 'fs-extra';
import * as node_path from 'path';
import * as unzip from 'unzip';
import * as child_process from 'child_process';
import log from 'log-formatter';

import * as FilePath from '../FilePath';

/**
 * 从指定的备份文件中恢复数据
 */

(async () => {
    const filename = process.argv[2];
    const path = node_path.join(FilePath._userDataBackupDir, filename);
    await fs.promises.access(path); //确保地址没有问题
    log.round('开始恢复备份', filename);

    await fs.remove(FilePath._userCodeDir);
    log.round('删除用户代码目录成功', FilePath._userCodeDir);

    await fs.remove(FilePath._recycleDir);
    log.round('删除回收站目录成功', FilePath._recycleDir);

    await fs.remove(FilePath._databaseDir);
    log.round('删除数据库目录成功', FilePath._databaseDir);

    await fs.remove(FilePath._logoDir);
    log.round('删除图标目录成功', FilePath._logoDir);

    await fs.remove(FilePath._libraryDir);
    await fs.remove(node_path.join(FilePath._userDataDir, 'package.json'));
    log.round('删除类库目录成功', FilePath._libraryDir);

    //todo 这里需要测试
    await new Promise((resolve, reject) => {
        fs.createReadStream(path).pipe(unzip.Extract({ path: FilePath._userDataDir }))
            .on('error', reject).on('close', resolve);
    });
    log.round('解压备份文件成功', filename);

    child_process.execFileSync('npm', ['i'], { cwd: FilePath._userDataDir });
    log.round('类库安装成功');

    log.bold('恢复成功。');
})();