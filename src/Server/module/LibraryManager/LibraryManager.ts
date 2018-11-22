import * as fs from 'fs-extra';
import * as child_process from 'child_process';
import * as _ from 'lodash';
import { BaseServiceModule } from "service-starter";
import log from 'log-formatter';

import * as FilePath from '../../FilePath';
import { MainProcessCommunicator } from '../MainProcess/MainProcessCommunicator';

/**
 * 库管理器，用于让用户安装运行代码所需的类库
 */
export class LibraryManager extends BaseServiceModule {

    private _mainProcessCommunicator: MainProcessCommunicator;

    async onStart(): Promise<void> {
        this._mainProcessCommunicator = this.services.MainProcessCommunicator;

        //检查 '/user-data/package.json' 是否存在，不存在就初始化一个
        try {
            await fs.promises.access(FilePath.packageJson);
        } catch {
            await fs.writeJson(FilePath.packageJson, {
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
        const obj = await fs.readJson(FilePath.packageJson);
        return _.map(obj.dependencies, (value, key) => ({ name: key, version: value }));
    }

    /**
     * 安装类库
     */
    installLibrary(libraryName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            child_process.execFile('npm', ['i', '-s', libraryName], { cwd: FilePath._userDataDir, }, (err, stdout, stderr) => {
                if (this._mainProcessCommunicator.isDebug)
                    log.location.text.round.content(this.name, 'installLibrary', stdout, stderr);

                err ? reject(err) : resolve();
            });
        });
    }

    /**
     * 卸载类库
     */
    uninstallLibrary(libraryName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            child_process.execFile('npm', ['uninstall', '-s', libraryName], { cwd: FilePath._userDataDir }, (err, stdout, stderr) => {
                if (this._mainProcessCommunicator.isDebug)
                    log.location.text.round.content(this.name, 'uninstallLibrary', stdout, stderr);

                err ? reject(err) : resolve();
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