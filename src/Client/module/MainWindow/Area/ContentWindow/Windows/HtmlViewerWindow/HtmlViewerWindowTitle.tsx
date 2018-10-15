import { oVar } from 'observable-variable';

import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { HtmlViewerWindowArgs } from '../../ContentWindowTypes';

/**
 * 顶部选项卡标题栏
 */
export class HtmlViewerWindowTitle extends BaseWindowTitle<HtmlViewerWindowArgs> {

    protected _title: string;
    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath('.html')}`;

    constructor(props: any, context: any) {
        super(props, context);

        this.props.communicator.loading = this._loading;
        this.props.communicator.title = oVar('');

        this._loading.value = true;

        this.props.communicator.title.on('set', (value: string) => {
            this._title = `(查看) ${value || this.props.args.name}`;
        });
    }

    componentDidMount() {
        super.componentDidMount();
        this.watch([this.props.communicator.title]);
    }
}