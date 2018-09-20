import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { permanent_oVar } from '../../../../../../global/Tools/PermanentVariable';
import { Splitter } from '../../../../../../global/Component/Splitter/Splitter';
import { displayType } from '../../FunctionArea';
import { UserCode } from './component/UserCode/UserCode';
import { ProgramData } from './component/ProgramData/ProgramData';
import { Recycle } from './component/Recycle/Recycle';

const less = require('./FileManager.less');

/**
 * 文件资源管理器
 */
export class FileManager extends ObservableComponent {

    private _programData: ProgramData;

    private _recycle: Recycle;

    /**
     * 程序数据窗口高度
     */
    private readonly _programDataHeight = permanent_oVar('ui.FileManager._programDataHeight', '300');

    /**
     * 回收站窗口高度
     */
    private readonly _recycleHeight = permanent_oVar('ui.FileManager._recycleHeight', '300');

    private readonly _change_programDataHeight = (position: number) => {
        if (!this._programData._folded.value) {
            if (this._recycle._folded.value)
                this._programDataHeight.value = window.innerHeight - position - 25 * 2 - 3;
            else
                this._programDataHeight.value = window.innerHeight - position - this._recycleHeight.value - 25 - 3;
        }
    };

    private readonly _change_recycleHeight = (position: number) => {
        if (!this._recycle._folded.value)
            this._recycleHeight.value = window.innerHeight - position - 25 - 3;
    };

    componentDidMount() {
        this.watch(displayType);
    }

    render() {
        return (
            <div id="FileManager" style={{ display: displayType.value === 'file' ? 'flex' : 'none' }}>
                <div className={less.header}>资源管理器</div>
                <UserCode title="用户代码" uniqueID="_userCode" />
                <Splitter className={less.splitter} onChange={this._change_programDataHeight} vertical />
                <ProgramData title="程序数据" uniqueID="_programData"
                    height={this._programDataHeight} ref={(e: any) => this._programData = e} />
                <Splitter className={less.splitter} onChange={this._change_recycleHeight} vertical />
                <Recycle title="回收站" uniqueID="_recycle"
                    height={this._recycleHeight} ref={(e: any) => this._recycle = e} />
            </div>
        );
    }
}