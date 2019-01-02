import * as React from 'react';

import { FileIcon } from '../../../FileIcon/FileIcon';

const less = require('./DeleteFiles.less');

/**
 * 要删除的项目
 */
export const DeleteFiles: React.StatelessComponent<{ items: { name: string, fullName: string, isDirectory: boolean }[] }> = (props) => {
    return (
        <div className={less.DeleteFiles}>
            {props.items.map(item =>
                <React.Fragment key={item.fullName}>
                    <FileIcon className={less.icon} filename={item.name} isFolder={item.isDirectory} />
                    <input type="text" className={less.filename} readOnly value={item.fullName} />
                </React.Fragment>
            )}
        </div>
    );
};