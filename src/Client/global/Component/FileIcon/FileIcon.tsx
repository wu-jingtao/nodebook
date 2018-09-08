import * as React from 'react';

import { getIconPath } from './GetIconPath';

const less = require('./FileIcon.less');

/**
 * 文件图标
 */
export class FileIcon extends React.PureComponent<{ filename: string, isFolder: boolean, opened?: boolean, rootFolder?: boolean }> {
    render() {
        return <img className={less.FileIcon} src={`/static/res/img/file_icons/${
            getIconPath(
                this.props.filename,
                this.props.isFolder,
                this.props.opened,
                this.props.rootFolder
            )}`} />
    }
}