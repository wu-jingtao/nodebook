import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { windowList, moveToOtherSide } from '../../ContentWindow';
import { Window } from '../../ContentWindowTypes';

const less = require('./BaseWindow.less');

/**
 * 功能按钮
 */
export abstract class BaseWindowFunctionButtons extends ObservableComponent<{ window: Window, position: 'left' | 'right' }> {

    protected abstract functionButtons: JSX.Element;

    componentDidMount() {
        this.watch(windowList.focusedWindow);
    }

    render() {
        return (
            <div className={less.functionButtons} style={{
                display: windowList.focusedWindow.value &&
                    windowList.focusedWindow.value.side === this.props.position &&
                    windowList.focusedWindow.value.type === this.props.window.type &&
                    windowList.focusedWindow.value.name === this.props.window.name ? 'block' : 'none'
            }}>
                {this.functionButtons}
                <img src={`/static/res/img/buttons_icon/${this.props.position === 'left' ? 'next' : 'previous'}-inverse.svg`}
                    title={`移动到${this.props.position === 'left' ? '右' : '左'}侧显示`}
                    onClick={() => moveToOtherSide({ name: this.props.window.name, type: this.props.window.type, side: this.props.position })} />
            </div>
        );
    }
}