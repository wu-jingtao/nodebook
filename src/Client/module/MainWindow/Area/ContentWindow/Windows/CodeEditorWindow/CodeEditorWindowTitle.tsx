import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';

/**
 * 顶部选项卡标题栏
 */
export class CodeEditorWindowTitle extends BaseWindowTitle<CodeEditorWindowArgs> {
    protected _icon: string;
    protected _title: string;
    protected _prompt: string;

    constructor(props: any, context: any) {
        super(props, context);

        this._prompt = this.props.args.args.path;
        this._title = this.props.args.name;
        this._icon = `/static/res/img/file_icons/${getIconPath(this._title)}`;
    }

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

        this._loading.value = true; //测试
    }
}