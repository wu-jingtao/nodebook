import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
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
}