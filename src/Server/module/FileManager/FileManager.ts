import * as fs from 'fs-extra';
import * as node_path from 'path';
import * as moment from 'moment';
import * as archiver from 'archiver';
import * as unzip from 'unzip';
import * as Error from 'http-errors';
import { BaseServiceModule } from "service-starter";

/**
 * 用户文件操作。
 */
export class FileManager extends BaseServiceModule {

    //#region 系统文件路径

    /**
     * nodebook程序目录
     */
    static readonly _appDir = '/app/';

    /**
     * openssl证书目录
     */
    static readonly _opensslKeyDir = '/key/';

    /**
     * 用户数据存放目录
     */
    static readonly _userDataDir = '/user_data/';

    /**
     * 程序数据存放目录
     */
    static readonly _programDataDir = '/program_data/';

    /**
     * nodebook客户端程序文件目录
     */
    static readonly _appClientFileDir = node_path.join(FileManager._appDir, 'Client/');

    /**
     *用户代码存放目录
     */
    static readonly _userCodeDir = node_path.join(FileManager._userDataDir, 'code/');

    /**
     * 用户安装的依赖库目录
     */
    static readonly _libraryDir = node_path.join(FileManager._userDataDir, 'node_modules/');

    /**
     * 回收站目录，暂存用户删除的代码
     */
    static readonly _recycleDir = node_path.join(FileManager._userDataDir, 'recycle/');

    /**
     * 数据库文件存放目录
     */
    static readonly _databaseDir = node_path.join(FileManager._userDataDir, 'db/');

    /**
     * openssl私钥路径
     */
    static readonly _opensslPrivkeyPath = node_path.join(FileManager._opensslKeyDir, 'privkey.pem');

    /**
     * openssl公钥路径
     */
    static readonly _opensslCertPath = node_path.join(FileManager._opensslKeyDir, 'cert.pem');

    /**
     * 数据库文件路径
     */
    static readonly _databasePath = node_path.join(FileManager._databaseDir, 'nodebook_system_data.db');

    //#endregion

    //#region 断言方法

    /**
     * 断言某个路径是否存在
     */
    private static async _isPathExists(path: string) {
        try {
            await fs.promises.access(path);
        } catch  {
            throw new Error.BadRequest(`要操作的路径不存在 '${path}'`);
        }
    }

    /**
     * 断言某个路径是一个文件
     */
    private static async _isFile(path: string) {
        let stats;

        try {
            stats = await fs.promises.stat(path);
        } catch  {
            throw new Error.BadRequest(`没有要操作的文件 '${path}'`);
        }

        if (!stats.isFile())
            throw new Error.BadRequest(`要操作的不是一个文件 '${path}'`);
    }

    /**
     * 断言某个路径是一个目录
     */
    private static async _isDirectory(path: string) {
        let stats;

        try {
            stats = await fs.promises.stat(path);
        } catch  {
            throw new Error.BadRequest(`没有要操作的目录 '${path}'`);
        }

        if (!stats.isDirectory())
            throw new Error.BadRequest(`要操作的不是一个目录 '${path}'`);
    }

    /**
     * 判断某个路径是否以什么开头，如果都不匹配则抛出异常
     */
    private static _pathStartWith(path: string, startWith: string[]): void {
        if (!startWith.some(item => path.startsWith(item)))
            throw new Error.Forbidden(`无权操作路径 '${path}'`);
    }

    //#endregion

    async onStart(): Promise<void> {
        //创建程序需要用到的目录
        await fs.ensureDir(FileManager._userCodeDir);
        await fs.ensureDir(FileManager._libraryDir);
        await fs.ensureDir(FileManager._recycleDir);
        await fs.ensureDir(FileManager._databaseDir);
    }

    /**
     * 列出某个目录中的子目录与文件。注意，只允许查看 '_userCodeDir' 、'_programDataDir' 、'_recycleDir' 与 '_libraryDir' 这四个目录下的内容
     */
    async listDirectory(path: string): Promise<{ name: string, isFile: boolean, modifyTime: number, size: number }[]> {
        FileManager._pathStartWith(path, [FileManager._userCodeDir, FileManager._programDataDir, FileManager._recycleDir, FileManager._libraryDir]);
        await FileManager._isDirectory(path);

        const result = [];

        for (const name of await fs.promises.readdir(path)) {
            const stats = await fs.promises.stat(node_path.join(path, name));
            if (stats.isFile() || stats.isDirectory())
                result.push({ name, isFile: stats.isFile(), modifyTime: stats.mtimeMs, size: stats.size });
        }

        return result;
    }

    /**
     * 创建目录。注意，只允许在 '_userCodeDir' 、'_programDataDir' 之下创建目录。
     */
    async createDirectory(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FileManager._userCodeDir, FileManager._programDataDir]);

        await fs.ensureDir(path);
    }

    /**
     * 复制文件或整个目录。注意，复制目录的时候，只会将目录中的内容（不包括目录本身）复制到目标目录下。
     * 只允许在 '_userCodeDir' 、'_programDataDir' 、'_recycleDir' 之间复制粘贴内容。
     * 不允许向 '_recycleDir' 中粘贴内容
     */
    async copy(from: string, to: string): Promise<void> {
        FileManager._pathStartWith(from, [FileManager._userCodeDir, FileManager._programDataDir, FileManager._recycleDir]);
        FileManager._pathStartWith(to, [FileManager._userCodeDir, FileManager._programDataDir]);
        await FileManager._isPathExists(from);

        await fs.copy(from, to, { dereference: true, overwrite: true });
    }

    /**
     * 移动文件或整个目录。注意，只允许在 '_userCodeDir' 、'_programDataDir' 、'_recycleDir' 之间移动内容。
     * 不允许向 '_recycleDir' 中移动内容
     */
    async move(from: string, to: string): Promise<void> {
        FileManager._pathStartWith(from, [FileManager._userCodeDir, FileManager._programDataDir, FileManager._recycleDir]);
        FileManager._pathStartWith(to, [FileManager._userCodeDir, FileManager._programDataDir]);
        await FileManager._isPathExists(from);

        await fs.move(from, to, { overwrite: true });
    }

    /**
     * 从系统的其他位置，向 '_userCodeDir' 、'_programDataDir' 中添加内容。主要是给上传文件使用
     */
    async moveFromOutside(from: string, to: string): Promise<void> {
        FileManager._pathStartWith(to, [FileManager._userCodeDir, FileManager._programDataDir]);

        await fs.move(from, to, { overwrite: true });
    }

    /**
     * 删除 '_userCodeDir' 下的文件或目录。将删除后的内容放置到回收站，并且在删除文件或目录的名称末尾加上删除时间
     */
    async deleteCodeData(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FileManager._userCodeDir]);
        await FileManager._isPathExists(path);

        //为文件或目录加上时间
        const pathDetail = node_path.parse(path);

        const deletedPath = node_path.format({
            dir: pathDetail.dir,
            name: pathDetail.name + moment().format('_YYYY_MM_DD_HH_mm_ss'),
            ext: pathDetail.ext
        });

        await fs.move(path, deletedPath, { overwrite: true });
    }

    /**
     * 永久删除 '_userCodeDir' 下的文件或目录。不再将删除后的内容放置到回收站
     */
    async deleteCodeDataDirectly(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FileManager._userCodeDir]);
        await FileManager._isPathExists(path);

        await fs.remove(path);
    }

    /**
     * 清空回收站。永久删除 '_recycleDir' 下的所有文件或目录。
     */
    async cleanRecycle(): Promise<void> {
        await fs.remove(FileManager._recycleDir);
        await fs.ensureDir(FileManager._recycleDir);
    }

    /**
     * 永久删除 '_programDataDir' 下的文件或目录。
     */
    async deleteProgramData(path: string): Promise<void> {
        FileManager._pathStartWith(path, [FileManager._programDataDir]);
        await FileManager._isPathExists(path);

        await fs.remove(path);
    }

    /**
     * 读取某个文件
     */
    async readFile(path: string): Promise<NodeJS.ReadableStream> {
        FileManager._pathStartWith(path, [FileManager._userCodeDir, FileManager._programDataDir, FileManager._recycleDir, FileManager._libraryDir]);
        await FileManager._isFile(path);

        return fs.createReadStream(path);
    }

    /**
     * 压缩某个文件或目录，便于用户下载
     */
    async zipData(path: string): Promise<NodeJS.ReadableStream> {
        FileManager._pathStartWith(path, [FileManager._userCodeDir, FileManager._programDataDir, FileManager._recycleDir, FileManager._libraryDir]);
        await FileManager._isPathExists(path);

        const fileStat = await fs.promises.stat(path);
        const archive = archiver('zip', { zlib: { level: 9 } });

        if (fileStat.isFile()) {
            const pathDetail = node_path.parse(path);
            archive.file(path, { name: pathDetail.base });
        } else if (fileStat.isDirectory())
            archive.directory(path, false);

        archive.finalize();
        return archive;
    }

    /**
     * 解压用户上传的zip文件到指定目录。注意，只允许解压到 '_userCodeDir' 、'_programDataDir' 之下
     */
    unzipData(zipFile: string, to: string): Promise<void> {
        return new Promise((resolve, reject) => {
            FileManager._pathStartWith(to, [FileManager._userCodeDir, FileManager._programDataDir]);
            
            fs.createReadStream(zipFile).pipe(unzip.Extract({ path: to }))
                .on('error', err => reject(err))
                .on('close', () => fs.remove(zipFile, err => err ? reject(err) : resolve()));   //解压完成后删除压缩文件
        });
    }
}