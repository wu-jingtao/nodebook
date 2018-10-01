import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { Window } from '../../ContentWindowTypes';
import { windowList } from '../../ContentWindow';

const less = require('../BaseWindow.less');

export abstract class BaseWindowContent extends ObservableComponent<{ window: Window, position: 'left' | 'right' }> {

    protected abstract content: JSX.Element;

    componentDidMount() {
        this.watch(windowList.focusedWindow);
    }

    render() {
        return (
            <div className={less.content} style={{
                display: windowList.focusedWindow.value &&
                    windowList.focusedWindow.value.side === this.props.position &&
                    windowList.focusedWindow.value.type === this.props.window.type &&
                    windowList.focusedWindow.value.name === this.props.window.name ? 'block' : 'none'
            }}>
                {this.content}
            </div>
        );
    }
}