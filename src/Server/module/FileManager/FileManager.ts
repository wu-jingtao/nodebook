import * as util from 'util';
import * as fs from 'fs-extra';
import * as node_path from 'path';
import * as moment from 'moment';
import * as archiver from 'archiver';
import * as unzipper from 'unzipper';
import { BaseServiceModule } from "service-starter";
const isBinaryFile: (path: string) => Promise<boolean> = util.promisify(require('isbinaryfile'));

import * as FilePath from '../../FilePath';

/**
 * 用户文件操作。
 */
export class FileManager extends BaseServiceModule {

    /**
     * 判断某个路径是否以什么开头，如果都不匹配则抛出异常
     */
    private static _pathStartWith(path: string, startWith: string[]): void {
        if (path.length > 4000 || !startWith.some(item => !node_path.relative(item, path).startsWith('../')))
            throw new Error(`无权操作路径 '${path}'`);
    }

    /**
     * 断言给出的路径是一个文件
     */
    static async _isFile(path: string): Promise<void> {
        if (!(await fs.promises.stat(path)).isFile())
            throw new Error(`路径 '${path}' 不是一个文件`);
    }

    /**
     * 断言给出的路径是一个目录
     */
    static async _isDirectory(path: string): Promise<void> {
        if (!(await fs.promises.stat(path)).isDirectory())
            throw new Error(`路径 '${path}' 不是一个目录`);
    }

    async onStart(): Promise<void> {
        //创建程序需要用到的目录
        await fs.ensureDir(FilePath._opensslKeyDir);
        await fs.ensureDir(FilePath._userCodeDir);
        await fs.ensureDir(FilePath._userDataBackupDir);
        await fs.ensureDir(FilePath._recycleDir);
        await fs.ensureDir(FilePath._databaseDir);
        await fs.ensureDir(FilePath._libraryDir);

        //复制程序图标
        await fs.copy(node_path.join(FilePath._appClientFileDir, './res/img/logo'), FilePath._logoDir, { overwrite: false });
    }

    /**
     * 查询某个单独的文件的状态信息
     * @param path 文件的绝对路径
     */
    async fileStatus(path: string): Promise<{ isBinary: boolean, modifyTime: number, size: number }> {
        FileManager._pathStartWith(path, [FilePath._userCodeDir, FilePath._programDataDir, FilePath._recycleDir, FilePath._libraryDir]);
        const stats = await fs.promises.stat(path);

        return {
            isBinary: await isBinaryFile(path),
            modifyTime: stats.mtimeMs,
            size: stats.size
        }
    }

    /**
     * 列出某个目录中的子目录与文件。注意，只允许查看 '_userCodeDir' 、'_programDataDir' 、'_recycleDir' 与 '_libraryDir' 这四个目录下的内容
     */
    async listDirectory(path: string): Promise<{ name: string, isFile: boolean, isBinary: boolean, modifyTime: number, size: number }[]> {
        FileManager._pathStartWith(path, [FilePath._userCodeDir, FilePath._programDataDir, FilePath._recycleDir, FilePath._libraryDir]);
        const result = [];

        for (const name of await fs.promises.readdir(path)) {
            const itemPath = node_path.join(path, name);
            const stats = await fs.promises.stat(itemPath);

            if (stats.isFile() || stats.isDirectory()) {
                const isFile = stats.isFile();
                const isBinary = isFile && await isBinaryFile(itemPath);
                result.push({ name, isFile, isBinary, modifyTime: stats.mtimeMs, size: stats.size });
            }
        }

        return result;
    }

    /**
     * 创建目录。注意，只允许在 '_userCodeDir' 、'_programDataDir' 之下创建目录。
     */
    async createDirectory(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FilePath._userCodeDir, FilePath._programDataDir]);

        await fs.ensureDir(path);
    }

    /**
     * 复制文件或整个目录。注意，复制目录的时候，只会将目录中的内容（不包括目录本身）复制到目标目录下。
     * 只允许在 '_userCodeDir' 、'_programDataDir' 、'_recycleDir' 之间复制粘贴内容。
     * 不允许向 '_recycleDir' 中粘贴内容
     */
    async copy(from: string, to: string): Promise<void> {
        FileManager._pathStartWith(from, [FilePath._userCodeDir, FilePath._programDataDir, FilePath._recycleDir]);
        FileManager._pathStartWith(to, [FilePath._userCodeDir, FilePath._programDataDir]);

        await fs.copy(from, to, { dereference: true, overwrite: true });
    }

    /**
     * 移动文件或整个目录。注意，只允许在 '_userCodeDir' 、'_programDataDir' 、'_recycleDir' 之间移动内容。
     * 不允许向 '_recycleDir' 中移动内容
     */
    async move(from: string, to: string): Promise<void> {
        FileManager._pathStartWith(from, [FilePath._userCodeDir, FilePath._programDataDir, FilePath._recycleDir]);
        FileManager._pathStartWith(to, [FilePath._userCodeDir, FilePath._programDataDir]);

        await fs.move(from, to, { overwrite: true });
    }

    /**
     * 从系统的其他位置，向 '_userCodeDir' 、'_programDataDir' 中添加内容。主要是给上传文件使用
     */
    async moveFromOutside(from: string, to: string): Promise<void> {
        FileManager._pathStartWith(to, [FilePath._userCodeDir, FilePath._programDataDir]);

        await fs.move(from, to, { overwrite: true });
    }

    /**
     * 删除 '_userCodeDir' 下的文件或目录。将删除后的内容放置到回收站，并且在删除文件或目录的名称末尾加上删除时间
     */
    async deleteCodeData(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FilePath._userCodeDir]);

        //为文件或目录加上时间
        const pathDetail = node_path.parse(path);

        const deletedPath = node_path.format({
            dir: FilePath._recycleDir,
            name: pathDetail.name + moment().format('_YYYY-MM-DD_HH-mm-ss'),
            ext: pathDetail.ext
        });

        await fs.move(path, deletedPath, { overwrite: true });
    }

    /**
     * 永久删除 '_userCodeDir' 下的文件或目录。不再将删除后的内容放置到回收站
     */
    async deleteCodeDataDirectly(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FilePath._userCodeDir]);

        await fs.remove(path);
    }

    /**
     * 永久删除 '_programDataDir' 下的文件或目录。
     */
    async deleteProgramData(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FilePath._programDataDir]);

        await fs.remove(path);
    }

    /**
     * 永久删除 '_recycleDir' 下的文件或目录。
     */
    async deleteRecycleData(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FilePath._recycleDir]);

        await fs.remove(path);
    }

    /**
     * 清空回收站。永久删除 '_recycleDir' 下的所有文件或目录。
     */
    async cleanRecycle(): Promise<void> {
        await fs.remove(FilePath._recycleDir);
        await fs.ensureDir(FilePath._recycleDir);
    }

    /**
     * 读取某个文件
     */
    async readFile(path: string): Promise<NodeJS.ReadableStream> {
        FileManager._pathStartWith(path, [FilePath._userCodeDir, FilePath._programDataDir, FilePath._recycleDir, FilePath._libraryDir]);
        await FileManager._isFile(path);
        return fs.createReadStream(path);
    }

    /**
     * 压缩某个文件或目录。注意，只允许在 '_userCodeDir' 、'_programDataDir' 之下创建压缩文件。
     */
    zipData(path: string, to: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                FileManager._pathStartWith(path, [FilePath._userCodeDir, FilePath._programDataDir]);
                FileManager._pathStartWith(to, [FilePath._userCodeDir, FilePath._programDataDir]);

                await fs.ensureFile(to);
                const output = fs.createWriteStream(to);
                const fileStat = await fs.promises.stat(path);
                const archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', resolve);
                archive.on('error', (err) => {
                    fs.remove(to).catch(() => { }); //确保不会生成空压缩包
                    reject(err);
                });

                if (fileStat.isFile())
                    archive.file(path, { name: node_path.basename(path) });
                else if (fileStat.isDirectory())
                    archive.directory(path, node_path.basename(path));

                archive.finalize();
                archive.pipe(output);
            } catch (error) { reject(error); }
        });
    }

    /**
     * 解压压缩文件。注意，只允许解压到 '_userCodeDir' 、'_programDataDir'。
     */
    unzipData(path: string, to: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                FileManager._pathStartWith(path, [FilePath._userCodeDir, FilePath._programDataDir]);
                FileManager._pathStartWith(to, [FilePath._userCodeDir, FilePath._programDataDir]);
                await FileManager._isFile(path);

                fs.createReadStream(path).pipe(unzipper.Extract({ path: to })).on('error', reject).on('close', resolve);
            } catch (error) { reject(error); }
        });
    }

    /**
     * 压缩某个文件或目录，用于用户下载
     */
    async zipDownloadData(path: string): Promise<NodeJS.ReadableStream> {
        FileManager._pathStartWith(path, [FilePath._userCodeDir, FilePath._programDataDir, FilePath._recycleDir, FilePath._libraryDir]);

        const fileStat = await fs.promises.stat(path);
        const archive = archiver('zip', { zlib: { level: 9 } });

        if (fileStat.isFile())
            archive.file(path, { name: node_path.basename(path) });
        else if (fileStat.isDirectory())
            archive.directory(path, false);

        archive.finalize();
        return archive;
    }
}