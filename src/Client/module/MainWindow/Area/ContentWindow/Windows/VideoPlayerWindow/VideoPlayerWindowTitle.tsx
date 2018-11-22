import { getIconPath } from '../../../../../../global/Component/FileIcon/GetIconPath';
import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { VideoPlayerWindowArgs } from '../../ContentWindowTypes';

export class VideoPlayerWindowTitle extends BaseWindowTitle<VideoPlayerWindowArgs> {
    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/${getIconPath(this.props.args.args.path.split('/').pop() as string)}`;
}