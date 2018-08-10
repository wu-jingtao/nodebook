import * as fs from 'fs-extra';
import * as path from 'path';
import * as child_process from 'child_process';
import * as _ from 'lodash';
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
        } catch (error) {
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
     * 安装或更新类库
     */
    async installLibrary(libraryName: string) {
        return new Promise((resolve, reject) => {
            libraryName = libraryName.replace(/"/g, '\\"'); //转义引号，防止 bash 脚本注入

            child_process.exec(`npm uninstall --save "${libraryName}"`, { cwd: FileManager._userDataDir }, function (err) {
                if (err)
                    reject(err);
                else {
                    child_process.exec(`npm install --save "${libraryName}"`, { cwd: FileManager._userDataDir }, function (err) {
                        err ? reject(err) : resolve();
                    });
                }
            });
        });
    }
}