import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';

/**
 * 顶部选项卡标题栏
 */
export class CodeEditorWindowTitle extends BaseWindowTitle<CodeEditorWindowArgs> {

    protected _title = this.props.args.name;
    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath(this._title)}`;

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