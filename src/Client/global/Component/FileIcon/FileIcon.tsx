import * as React from 'react';
import * as classnames from 'classnames';

import { getIconPath } from './GetIconPath';

const less = require('./FileIcon.less');

export interface FileIconPropsType {
    /**
     * 文件名称
     */
    filename: string;
    /**
     * 是不是文件夹
     */
    isFolder?: boolean;
    /**
     * 文件夹是否被打开
     */
    opened?: boolean;
    /**
     * 是不是根文件夹
     */
    rootFolder?: boolean;

    className?: string;
    style?: any;
}

/**
 * 文件图标
 */
export class FileIcon extends React.PureComponent<FileIconPropsType> {
    render() {
        return <img className={classnames(less.FileIcon, this.props.className)}
            style={this.props.style}
            src={`/static/res/img/file_icons/${
                getIconPath(
                    this.props.filename,
                    this.props.isFolder,
                    this.props.opened,
                    this.props.rootFolder
                )}`} />
    }
}