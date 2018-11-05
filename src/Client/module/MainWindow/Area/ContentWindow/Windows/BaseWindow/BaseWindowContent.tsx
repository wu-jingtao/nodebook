import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { windowList } from '../../WindowList';
import { WindowArgs } from '../../ContentWindowTypes';

const less = require('./BaseWindow.less');

export abstract class BaseWindowContent<T extends WindowArgs> extends ObservableComponent<{ args: T, side: 'left' | 'right', _communicator: { [key: string]: any } }> {

    private readonly _thisSide = this.props.side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    /**
     * 窗口组件间通信对象
     */
    protected readonly _communicator = this.props._communicator;

    /**
     * 要显示的内容
     */
    protected abstract _content: React.ReactNode;

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