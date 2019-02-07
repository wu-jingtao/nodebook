import * as React from 'react';
import { processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { ObservableComponentWrapper } from '../../../../../../global/Tools/ObservableComponent';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { MindMapWindowArgs } from '../../ContentWindowTypes';
import { unsavedFiles } from '../CodeEditorWindow/CodeEditorFileCache';

export class MindMapWindowTitle extends BaseWindowTitle<MindMapWindowArgs> {

    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath('.mindmap')}`;
    protected _title = <ObservableComponentWrapper watch={[unsavedFiles]} render={() => (
        <span style={{ color: unsavedFiles.has(this.props.args.args.path) ? '#cdab7a' : undefined }}>{this.props.args.name}</span>
    )} />

    constructor(props: any, context: any) {
        super(props, context);

        this._communicator.iframeReady = () => {    //当iframe加载完毕后调用
            this._loading.value = false;
            
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
        };

        this._loading.value = true;
    }
}