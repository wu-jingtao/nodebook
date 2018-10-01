import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';

/**
 * 顶部选项卡标题栏
 */
export class FileWindowTitle extends BaseWindowTitle {
    protected _icon: string;
    protected _title: string;
    protected _prompt: string;

    constructor(props: any, context: any) {
        super(props, context);

        this._prompt = this.props.window.name;
        this._title = this.props.window.name.split('/').pop() as string;
        this._icon = `/static/res/img/file_icons/${getIconPath(this._title)}`;
    }
}