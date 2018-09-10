import { oMap, ObservableMap } from 'observable-variable';

import { ServerApi } from '../../ServerApi';
import { FileIconTree } from "../FileIconTree/FileIconTree";
import { showMessageBox } from '../../../module/MessageBox/MessageBox';

/**
 * 基础文件树。实现了服务器端路径读取。
 */
export abstract class BaseFileTree extends FileIconTree {

    /**
     * 是否在服务器端加载过了
     */
    private _loaded = false;

    /**
     * 从服务器端加载目录数据
     */
    protected async _loadFolderData(): Promise<false | void> {
        if (this._data.subItem) {
            try {
                const data = await ServerApi.file.listDirectory(this._fullNameString);

                //清除不存在的
                for (const { name, subItem } of this._data.subItem.values()) {
                    if (data.findIndex(item => item.name === name && item.isFile === (subItem === undefined)) === -1)
                        this._data.subItem.delete(name);
                }

                //插入新的
                for (const item of data) {
                    if (!this._data.subItem.has(item.name)) {
                        this._data.subItem.set(item.name, {
                            name: item.name,
                            data: { size: item.size, modifyTime: item.modifyTime },
                            subItem: item.isFile ? undefined : oMap([])
                        });
                    }
                }

                this._loaded = true;
            } catch (err) {
                showMessageBox({ icon: "error", title: `读取目录数据失败`, content: `目录:'${this._fullNameString}'。${err.message}` });
                return false;
            }
        }
    }

    protected async _onOpenBranch(isOpen: boolean): Promise<false | void> {
        if (isOpen && this._loaded === false)
            return await this._loadFolderData();
    }
}

export interface DataTree {
    /**
     * 当前节点的名称。在兄弟节点当中应当是唯一的
     */
    name: string;

    data: { size: number, modifyTime: number };

    /**
     * 子项，如果存在则表示当前节点是一个分支
     */
    subItem?: ObservableMap<string, DataTree>;
}