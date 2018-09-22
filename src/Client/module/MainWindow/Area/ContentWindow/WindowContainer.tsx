import * as React from 'react';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { windowList } from './ContentWindow';

const less = require('./WindowContainer.less');

export class WindowContainer extends ObservableComponent<{ position: 'left' | 'right' }> {

    private readonly _thisSide = this.props.position === 'left' ? windowList.leftWindows : windowList.rightWindows;
    private readonly _otherSide = this.props.position === 'left' ? windowList.rightWindows : windowList.leftWindows;

    componentDidMount() {
        this.watch(this._thisSide, windowList.focusedWindow);
    }

    render() {


        return (
            <div className={less.WindowContainer}>
                <div className={less.titleBar}>
                    <div className={less.tabs}>

                    </div>
                    <div className={less.functionButtons}>

                    </div>
                </div>
                <div className={less.content}>

                </div>
            </div>
        );
    }
}