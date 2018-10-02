import * as React from 'react';
import { watch } from 'observable-variable';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { windowList } from '../../WindowList';
import { WindowArgs } from '../../ContentWindowTypes';

const less = require('./BaseWindow.less');

export abstract class BaseWindowContent<T extends WindowArgs> extends ObservableComponent<{ args: T, side: 'left' | 'right' }> {

    private readonly _thisSide = this.props.side === 'left' ? windowList.leftWindows : windowList.rightWindows;
    private _unWatch: Function;

    /**
     * 要显示的内容
     */
    protected abstract _content: JSX.Element;

    /**
     * 获取到焦点后触发的事件
     */
    protected abstract _onFocused(): void;

    componentDidMount() {
        this.watch([this._thisSide.displayOrder]);
        this._unWatch = watch([windowList.focusedSide], () => {
            if (windowList.focusedSide.value === this.props.side && this._thisSide.displayOrder.last === this.props.args.id)
                this._onFocused();
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._unWatch();
    }

    render() {
        return (
            <div className={less.content} style={{ display: this._thisSide.displayOrder.last === this.props.args.id ? 'block' : 'none' }}>
                {this._content}
            </div>
        );
    }
}