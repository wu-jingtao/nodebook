import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { ImageViewerWindowArgs } from '../../ContentWindowTypes';

export class ImageViewerWindowTitle extends BaseWindowTitle<ImageViewerWindowArgs> {

    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath(this.props.args.name)}`;

    constructor(props: any, context: any) {
        super(props, context);

        this.props.communicator.loading = this._loading;
        this._loading.value = true;
    }
}