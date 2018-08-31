import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponent } from "../../../../global/Tools/ObservableComponent";
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { FunctionAreaPropsType } from "./FunctionAreaPropsType";

const less = require('./FunctionArea.less');

/**
 * 侧边栏，功能区按钮
 */
export class FunctionArea extends ObservableComponent<FunctionAreaPropsType> {

    private readonly _width = oVar(300);    //功能区的宽度

    componentDidMount() {
        this.watch(this.props.functionAreaDisplayType, this._width);
    }

    render() {
        return (
            <div id="FunctionArea" style={{ width: this._width.value }}>
                <Splitter className={less.splitter} position={this._width} deviation={60} />
                <div className={less.content}>
                    
                </div>
            </div>
        );
    }
}