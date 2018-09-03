import * as React from 'react';

import { ObservableComponent } from "../../../../global/Tools/ObservableComponent";
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { permanent_oVar } from '../../../../global/Tools/PermanentVariable';
import { FileManager } from './FunctionPanel/FileManager/FileManager';
import { ShortcutManager } from './FunctionPanel/ShortcutManager/ShortcutManager';
import { TaskManager } from './FunctionPanel/TaskManager/TaskManager';
import { ServiceManager } from './FunctionPanel/ServiceManager/ServiceManager';
import { FunctionAreaPropsType } from "./FunctionAreaPropsType";

const less = require('./FunctionArea.less');

/**
 * 侧边栏，功能区按钮
 */
export class FunctionArea extends ObservableComponent<FunctionAreaPropsType> {

    private readonly _width = permanent_oVar('ui.FunctionArea._width', '300');    //功能区的宽度

    componentDidMount() {
        this.watch(this._width, this.props.functionAreaDisplayType);
    }

    render() {
        return (
            <div id="FunctionArea" style={{ width: this._width.value, display: this.props.functionAreaDisplayType.value === null ? 'none' : 'block' }}>
                <Splitter className={less.splitter} position={this._width} deviation={60} />
                <div className={less.content}>
                    <ShortcutManager
                        functionAreaDisplayType={this.props.functionAreaDisplayType}
                        contentWindows={this.props.contentWindows} />
                    <FileManager
                        functionAreaDisplayType={this.props.functionAreaDisplayType}
                        contentWindows={this.props.contentWindows}
                        fileManagerNumber={this.props.fileManagerNumber} />
                    <TaskManager
                        functionAreaDisplayType={this.props.functionAreaDisplayType}
                        contentWindows={this.props.contentWindows} />
                    <ServiceManager
                        functionAreaDisplayType={this.props.functionAreaDisplayType}
                        contentWindows={this.props.contentWindows}
                        serviceManagerErrorNumber={this.props.serviceManagerErrorNumber} />
                </div>
            </div>
        );
    }
}