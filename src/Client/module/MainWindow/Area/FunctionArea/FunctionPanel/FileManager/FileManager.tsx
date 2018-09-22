import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { permanent_oVar } from '../../../../../../global/Tools/PermanentVariable';
import { Splitter } from '../../../../../../global/Component/Splitter/Splitter';
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

    private _programDataPanel: ProgramDataPanel;

    private _recyclePanel: RecyclePanel;

    /**
     * 程序数据窗口高度
     */
    private readonly _programDataHeight = permanent_oVar('ui.FileManager._programDataHeight', '300');

    /**
     * 回收站窗口高度
     */
    private readonly _recycleHeight = permanent_oVar('ui.FileManager._recycleHeight', '300');

    private readonly _change_programDataHeight = (position: number) => {
        if (!this._programDataPanel._folded.value) {
            if (this._recyclePanel._folded.value)
                this._programDataHeight.value = window.innerHeight - position - 25 * 2;
            else
                this._programDataHeight.value = window.innerHeight - position - 25 * 2 - this._recycleHeight.value;
        }
    };

    private readonly _change_recycleHeight = (position: number) => {
        if (!this._recyclePanel._folded.value)
            this._recycleHeight.value = window.innerHeight - position - 25;
    };

    componentDidMount() {
        this.watch(displayType);
    }

    render() {
        return (
            <div id="FileManager" style={{ display: displayType.value === 'file' ? 'flex' : 'none' }}>
                <div className={less.header}>资源管理器</div>
                <UnsavedFilesPanel title="未保存的文件" uniqueID="_unsavedFilesPanel" noFold />
                <OpenedWindows title="打开的窗口" uniqueID="_openedWindows" noFold />
                <UserCodePanel title="用户代码" uniqueID="_userCode" />
                <Splitter className={less.splitter} onChange={this._change_programDataHeight} vertical />
                <ProgramDataPanel title="程序数据" uniqueID="_programData"
                    height={this._programDataHeight} ref={(e: any) => this._programDataPanel = e} />
                <Splitter className={less.splitter} onChange={this._change_recycleHeight} vertical />
                <RecyclePanel title="回收站" uniqueID="_recycle"
                    height={this._recycleHeight} ref={(e: any) => this._recyclePanel = e} />
            </div>
        );
    }
}