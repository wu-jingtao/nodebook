import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { ScrollBar } from '../../../../../../global/Component/ScrollBar/ScrollBar';
import { MultipleFoldableContainer } from '../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainer';
import { MultipleFoldableContainerPropsType } from '../../../../../../global/Component/MultipleFoldableContainer/MultipleFoldableContainerPropsType';
import { displayType } from '../../FunctionArea';
import { UserCodePanel } from './component/UserCodePanel/UserCodePanel';
import { ProgramDataPanel } from './component/ProgramDataPanel/ProgramDataPanel';
import { RecyclePanel } from './component/RecyclePanel/RecyclePanel';
import { UnsavedFilesPanel } from './component/UnsavedFilesPanel/UnsavedFilesPanel';
import { OpenedWindows } from './component/OpenedWindows/OpenedWindows';

const less = require('./FileManager.less');

/**
 * 文件资源管理器
 */
export class FileManager extends ObservableComponent {

    componentDidMount() {
        this.watch(displayType);
    }

    render() {
        return (
            <div id="FileManager" style={{ display: displayType.value === 'file' ? 'flex' : 'none' }}>
                <div className={less.header}>资源管理器</div>
                <ScrollBar className={less.top}>
                    <UnsavedFilesPanel title="未保存的文件" uniqueID="_unsavedFilesPanel" noFold />
                    <OpenedWindows title="打开的窗口" uniqueID="_openedWindows" noFold />
                </ScrollBar>
                <FileBrowserPanel className={less.bottom} uniqueID="FileManager" />
            </div >
        );
    }
}

class FileBrowserPanel extends MultipleFoldableContainer<MultipleFoldableContainerPropsType>{
    protected foldableContainers: JSX.Element[] = [
        <UserCodePanel title="用户代码" uniqueID="_userCode" />,
        <ProgramDataPanel title="程序数据" uniqueID="_programData" />,
        <RecyclePanel title="回收站" uniqueID="_recycle" />
    ];
}