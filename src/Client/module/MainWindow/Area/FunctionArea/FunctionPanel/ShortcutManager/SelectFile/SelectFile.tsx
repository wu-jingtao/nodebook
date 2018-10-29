import * as React from 'react';
import { ObservableVariable, oVar } from "observable-variable";

import { BaseFileTree } from "../../../../../../../global/Component/Tree/BaseFileTree/BaseFileTree";
import { FileIconTreePropsType } from "../../../../../../../global/Component/Tree/FileIconTree/FileIconTreePropsType";
import { ScrollBar } from '../../../../../../../global/Component/ScrollBar/ScrollBar';
import { ContextMenuItemOptions } from "../../../../../../ContextMenu/ContextMenuOptions";
import { showPopupWindow, closePopupWindow } from '../../../../../../PopupWindow/PopupWindow';
import { unsavedFiles } from '../../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';

const less = require('./SelectFile.less');

/**
 * 选择文件
 * @param filter 文件名过滤
 * @param lastPath 上次选择的文件路径
 */
export function selectFile(filter: RegExp, lastPath: string = ''): Promise<string> {
    return new Promise(resolve => {
        const filePath = oVar<string>(lastPath);

        const ok = () => {
            resolve(filePath.value);
            closePopupWindow(id);
        }

        const id = showPopupWindow({
            title: '选择文件',
            content: (
                <ScrollBar className={less.SelectFile}>
                    <div style={{ width: '2000px' }}>
                        <SelectFileTree name="/user_data/code" modifiedFiles={unsavedFiles}
                            filePath={filePath} ok={ok} filter={filter} />
                    </div>
                </ScrollBar>
            ),
            ok: { callback: ok },
            cancel: { callback() { resolve('') } }
        });
    });
}

class SelectFileTree extends BaseFileTree<FileIconTreePropsType & { filePath: ObservableVariable<string>, ok: () => void, filter: RegExp }> {

    constructor(props: any, context: any) {
        super(props, context);

        if (this._isRoot) {
            //展开与该文件相关的文件夹
            this.props.filePath.value.split('/').reduce((pre, cur) => {
                const result = pre ? pre + '/' + cur : '/' + cur;
                this._openedBranch.add(result);
                return result;
            });
        }

        if (this._fullNameString === this._root.props.filePath.value)
            this._backgroundColor.value = '#baa17c';
    }

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
        if (this._isBranch)
            return parentProps;
        else {
            return {
                ...parentProps,
                onDoubleClick: this._root.props.ok
            };
        }
    }

    protected _onContextMenu(): (ContextMenuItemOptions | void | false)[][] {
        return [];
    }

    protected async _onOpenItem(e: React.MouseEvent<HTMLDivElement>): Promise<void> {
        if (e.button === 0) {
            this._root.props.filePath.value = this._fullNameString;
        }
    }

    protected async _refreshFolder(): Promise<false | void> {
        if (this._dataTree.subItem && !this._loading.has('_refreshFolder')) {
            if (await super._refreshFolder() !== false) {

                //过滤文件
                for (const item of this._dataTree.subItem.values()) {
                    if (item.subItem === undefined) {
                        if (!this._root.props.filter.test(item.name))
                            this._dataTree.subItem.delete(item.name);
                    }
                }
            }
        }
    }
}