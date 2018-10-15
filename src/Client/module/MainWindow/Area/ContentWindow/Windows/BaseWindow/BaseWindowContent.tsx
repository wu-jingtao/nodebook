import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { windowList } from '../../WindowList';
import { WindowArgs } from '../../ContentWindowTypes';

const less = require('./BaseWindow.less');

export abstract class BaseWindowContent<T extends WindowArgs> extends ObservableComponent<{ args: T, side: 'left' | 'right', communicator: { [key: string]: any } }> {

    private readonly _thisSide = this.props.side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    /**
     * 要显示的内容
     */
    protected abstract _content: JSX.Element;

    componentDidMount() {
        this.watch([this._thisSide.displayOrder]);
    }

    render() {
        return (
            <div className={less.content} style={{ display: this._thisSide.displayOrder.last === this.props.args.id ? 'block' : 'none' }}>
                {this._content}
            </div>
        );
    }
}