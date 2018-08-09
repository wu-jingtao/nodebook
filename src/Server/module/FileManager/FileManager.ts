import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseServiceModule } from "service-starter";

/**
 * 文件操作。注意，只允许操作 '_userCodeDir' 、'_libraryDir' 、'_recycleDir' 与 '_programDataDir' 这四个目录下的内容
 */
export class FileManager extends BaseServiceModule {

    //#region 系统文件路径

    /**
     * 用户数据存放目录
     */
    static readonly _userDataDir = '/user-data';

    /**
     * 程序数据存放目录
     */
    static readonly _programDataDir = '/program-data';

    /**
     *用户代码存放目录
     */
    static readonly _userCodeDir = path.join(FileManager._userDataDir, 'code/');

    /**
     * 用户安装的依赖库目录
     */
    static readonly _libraryDir = path.join(FileManager._userDataDir, 'node_modules/');

    /**
     * 回收站目录，暂存用户删除的代码
     */
    static readonly _recycleDir = path.join(FileManager._userDataDir, 'recycle/');

    /**
     * 数据库文件存放目录
     */
    static readonly _databaseDir = path.join(FileManager._userDataDir, 'db/');

    /**
     * 数据库文件路径
     */
    static readonly _databasePath = path.join(FileManager._databaseDir, 'nodebook_system_data.db');

    //#endregion

    async onStart(): Promise<void> {
        //创建程序需要用到的目录
        await fs.ensureDir(FileManager._userCodeDir);
        await fs.ensureDir(FileManager._libraryDir);
        await fs.ensureDir(FileManager._recycleDir);
        await fs.ensureDir(FileManager._databaseDir);
    }

    /**
     * 检查传入的路径是否有权限操作
     */
    private _checkPath(path: string) {
        if (!(path.startsWith(FileManager._userCodeDir) || path.startsWith(FileManager._programDataDir) ||
            path.startsWith(FileManager._recycleDir) || path.startsWith(FileManager._libraryDir)))
            throw new Error(`无权操作 '${path}'`);
    }

    /**
     * 列出某个目录中的子目录与文件。
     */
    async listDirectory(_path: string): Promise<{ name: string, isFile: boolean }[]> {
        this._checkPath(_path);

        const result = [];

        for (const name of await fs.promises.readdir(_path)) {
            const stats = await fs.promises.stat(path.join(_path, name));
            if (stats.isFile() || stats.isDirectory())
                result.push({ name, isFile: stats.isFile() });
        }

        return result;
    }

    /**
     * 复制文件或整个目录。注意，复制目录的时候，只会将目录中内容（不包括目录本身）复制到目标目录下
     */
    async copy(from: string, to: string): Promise<void> {
        this._checkPath(from);
        this._checkPath(to);

        await fs.copy(from, to, { dereference: true, overwrite: true });
    }

    /**
     * 移动文件或整个目录
     */
    async move(from: string, to: string): Promise<void> {
        this._checkPath(from);
        this._checkPath(to);

        await fs.move(from, to, { overwrite: true });
    }

    /**
     * 从系统的其他位置，向限制目录中添加内容。主要是给上传文件使用
     */
    async moveFromOutside(from: string, to: string): Promise<void> {
        this._checkPath(to);

        await fs.move(from, to, { overwrite: true });
    }

    /**
     * 删除文件或整个目录
     */
    async remove(path: string): Promise<void> {
        this._checkPath(path);
        await fs.remove(path);
    }

    /**
     * 读取某个文件
     */
    readFile(path: string) {
        this._checkPath(path);
        return fs.createReadStream(path);
    }

    /**
     * 获取某个文件的大小。
     */
    async getFileSize(path: string) {
        this._checkPath(path);
        const stats = await fs.promises.stat(path);
        return stats.size;
    }
}