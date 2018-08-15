import * as fs from 'fs-extra';
import * as path from 'path';
import * as child_process from 'child_process';
import * as _ from 'lodash';
import * as Error from 'http-errors';
import { BaseServiceModule } from "service-starter";

import { FileManager } from '../FileManager/FileManager';

/**
 * 库管理器，用于让用户安装运行代码所需的类库
 */
export class LibraryManager extends BaseServiceModule {

    private readonly _package_json_path = path.join(FileManager._userDataDir, 'package.json');

    async onStart(): Promise<void> {
        //检查 '/user-data/package.json' 是否存在，不存在就初始化一个
        try {
            await fs.promises.access(this._package_json_path);
        } catch {
            await fs.writeJson(this._package_json_path, {
                name: 'nodebook-user-installed-library',
                version: '0.0.1',
                private: true,
                description: 'nodebook 用户安装的类库',
                dependencies: {}
            });
        }
    }

    /**
     * 获取安装了的类库列表
     */
    async getInstalledLibraries(): Promise<{ name: string, version: string }[]> {
        const obj = await fs.readJson(this._package_json_path);
        return _.map(obj.dependencies, (value, key) => ({ name: key, version: value }));
    }

    /**
     * 安装类库
     */
    installLibrary(libraryName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            child_process.execFile('npm', ['i', '-s', libraryName], { cwd: FileManager._userDataDir }, err => {
                err ? reject(new Error.BadRequest('安装失败：类库的名称可能不存在或其他原因')) : resolve();
            });
        });
    }

    /**
     * 卸载类库
     */
    uninstallLibrary(libraryName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            child_process.execFile('npm', ['uninstall', '-s', libraryName], { cwd: FileManager._userDataDir }, err => {
                err ? reject(new Error.BadRequest('卸载失败')) : resolve();
            });
        });
    }

    /**
     * 更新某个类库
     */
    async updateLibrary(libraryName: string): Promise<void> {
        await this.uninstallLibrary(libraryName);
        await this.installLibrary(libraryName);
    }
}