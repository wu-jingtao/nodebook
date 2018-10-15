import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { HtmlViewerWindowArgs } from '../../ContentWindowTypes';

import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';

/**
 * 顶部选项卡标题栏
 */
export class HtmlViewerWindowTitle extends BaseWindowTitle<HtmlViewerWindowArgs> {

    protected _title = `(查看) ${this.props.args.name}`;
    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath('.html')}`;

    constructor(props: any, context: any) {
        super(props, context);

        this.props.communicator.loading = this._loading;
        this._loading.value = true;
    }
}