import { oSet, watch } from 'observable-variable';

import { processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { MarkdownViewerWindowArgs } from '../../ContentWindowTypes';

export class MarkdownViewerWindowTitle extends BaseWindowTitle<MarkdownViewerWindowArgs> {

    //表示正在处理中的项目
    private readonly _processing = this._communicator.processing = oSet<string>([]);

    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath('.md')}`;

    componentDidMount() {
        super.componentDidMount();

        this._unobserve.push(watch([this._processing], () => {
            this._loading.value = this._processing.size > 0;
        }));

        const _watch_processingItems_add = (value: string) => {
            if (value === this.props.args.args.path)
                this._processing.add('watch_processingItems');
        };

        const _watch_processingItems_remove = (value: string) => {
            if (value === this.props.args.args.path)
                this._processing.delete('watch_processingItems');
        };

        //判断是否正在操作中
        if (processingItems.has(this.props.args.args.path))
            _watch_processingItems_add(this.props.args.args.path);

        processingItems.on('add', _watch_processingItems_add);
        processingItems.on('remove', _watch_processingItems_remove);

        this._unobserve.push(() => {
            processingItems.off('add', _watch_processingItems_add);
            processingItems.off('remove', _watch_processingItems_remove);
        });
    }
}