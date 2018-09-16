import * as React from 'react';

import { FileIcon } from '../../../FileIcon/FileIcon';
import { EditableFileTree } from '../EditableFileTree';

const less = require('./DeleteFiles.less');

/**
 * 要删除的项目
 */
export const DeleteFiles: React.StatelessComponent<{ items: { name: string, fullName: string, isDirectory: boolean }[] }> = (props) => {
    return (
        <div className={less.DeleteFiles}>
            {props.items.map(item =>
                <React.Fragment key={item.name}>
                    <FileIcon className={less.icon} filename={item.name} isFolder={item.isDirectory} />
                    <div className={less.filename}>{item.fullName}</div>
                </React.Fragment>
            )}
        </div>
    );
};