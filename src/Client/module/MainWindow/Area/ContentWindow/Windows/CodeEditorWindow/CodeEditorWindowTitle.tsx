import * as React from 'react';

import { ObservableComponentWrapper } from '../../../../../../global/Tools/ObservableComponent';
import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';
import { unsavedFiles } from './CodeEditorFileCache';

/**
 * 顶部选项卡标题栏
 */
export class CodeEditorWindowTitle extends BaseWindowTitle<CodeEditorWindowArgs> {

    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath(this.props.args.name)}`;
    protected _title = <ObservableComponentWrapper watch={[unsavedFiles]} render={() => (
        <span style={{ color: unsavedFiles.has(this.props.args.args.path) ? '#cdab7a' : undefined }}>{this.props.args.name}</span>
    )} />

    componentDidMount() {
        super.componentDidMount();

        const _watch_processingItems_add = (value: string) => {
            if (value === this.props.args.args.path)
                this._loading.value = true;
        };

        const _watch_processingItems_remove = (value: string) => {
            if (value === this.props.args.args.path)
                this._loading.value = false;
        };

        //判断是否正在操作中
        if (processingItems.has(this.props.args.args.path))
            this._loading.value = true;

        processingItems.on('add', _watch_processingItems_add);
        processingItems.on('remove', _watch_processingItems_remove);

        this._unobserve.push(() => {
            processingItems.off('add', _watch_processingItems_add);
            processingItems.off('remove', _watch_processingItems_remove);
        });
    }
}