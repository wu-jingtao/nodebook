import * as React from 'react';
import { FileIcon } from '../../../../../../../../global/Component/FileIcon/FileIcon';
import { unsavedFiles } from '../../../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';

const less_deleteFiles = require('../../../../../../../../global/Component/Tree/EditableFileTree/DeleteFiles/DeleteFiles.less');
const less_userCodePanel = require('./UserCodePanel.less');

/**
 * 删除未保存的文件
 */
const DeleteUnsavedFiles: React.StatelessComponent<{ action: 'delete' | 'cut', items: string[] }> = (props) => {
    return (
        <>
            <div className={less_userCodePanel.DeleteUnsavedFiles}>检测到以下文件并未保存，继续{props.action === 'delete' ? '删除' : '剪切'}将会使得更改的内容丢失，是否继续?</div>
            <div className={less_deleteFiles.DeleteFiles}>
                {props.items.map(item =>
                    <React.Fragment key={item}>
                        <FileIcon className={less_deleteFiles.icon} filename={item.split('/').pop() as string} />
                        <input type="text" className={less_deleteFiles.filename} readOnly value={item} />
                    </React.Fragment>
                )}
            </div>
        </>
    );
};

/**
 * 检测给定路径下是否有未保存到文件
 * @param descendants 是否包含后代，主要是针对文件夹
 */
export function checkUnsavedFile(path: string, action: 'delete' | 'cut', descendants?: boolean): Promise<boolean> {
    return new Promise(resolve => {
        if (descendants) path += '/'; //在路径的末尾加上'/'是为了避免误把同级同名文件误认为子级文件的情况

        const unsaved = descendants ? [...unsavedFiles.value].filter(item => item.startsWith(path)) :
            unsavedFiles.has(path) ? [path] : [];

        if (unsaved.length > 0) {
            showPopupWindow({
                title: `${action === 'delete' ? '删除' : '剪切'}未保存的文件`,
                content: <DeleteUnsavedFiles action={action} items={unsaved} />,
                ok: { callback() { resolve(true) } },
                cancel: { callback() { resolve(false) } }
            });
        } else
            resolve(true);
    });
}