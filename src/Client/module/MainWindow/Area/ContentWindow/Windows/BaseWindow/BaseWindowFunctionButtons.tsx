import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { WindowArgs } from '../../ContentWindowTypes';
import { windowList, moveToOtherSide } from '../../WindowList';

const less = require('./BaseWindow.less');

/**
 * 功能按钮
 */
export abstract class BaseWindowFunctionButtons<T extends WindowArgs> extends ObservableComponent<{ args: T, side: 'left' | 'right', state: { [key: string]: any } }> {

    private readonly _thisSide = this.props.side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    protected abstract _functionButtons: JSX.Element;

    componentDidMount() {
        this.watch([this._thisSide.displayOrder]);
    }

    render() {
        return (
            <div className={less.functionButtons}
                style={{ display: this._thisSide.displayOrder.last === this.props.args.id ? 'block' : 'none' }}>
                {this._functionButtons}
                <img src={`/static/res/img/buttons_icon/${this.props.side === 'left' ? 'next' : 'previous'}-inverse.svg`}
                    title={`移动到${this.props.side === 'left' ? '右' : '左'}侧显示`}
                    onClick={() => moveToOtherSide(this.props.args.id, this.props.side)} />
            </div>
        );
    }
}