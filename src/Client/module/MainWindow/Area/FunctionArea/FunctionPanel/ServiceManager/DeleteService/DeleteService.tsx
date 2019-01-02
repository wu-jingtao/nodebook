import * as React from 'react';

import { FileIcon } from '../../../../../../../global/Component/FileIcon/FileIcon';

const less = require('./DeleteService.less');

/**
 * 要删除的服务
 */
export const DeleteService: React.StatelessComponent<{ items: { serviceName: string, taskPath: string }[] }> = (props) => {
    return (
        <div className={less.DeleteService}>
            {props.items.map(item =>
                <React.Fragment key={item.taskPath}>
                    <FileIcon className={less.icon} filename={item.taskPath}/>
                    <input type="text" className={less.serviceName} readOnly value={item.serviceName} />
                </React.Fragment>
            )}
        </div>
    );
};