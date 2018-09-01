import * as React from 'react';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { ObservableVariable } from 'observable-variable';
import { throttle } from '../../Tools/Tools';

interface SplitterPropsType {
    /**
     * 当前分隔条相对于页面所处的位置
     */
    position: ObservableVariable<number>;

    /**
     * 相对于鼠标位置的偏差大小，默认0
     */
    deviation?: number;

    /**
     * 设置为垂直方向分隔条，默认水平
     */
    vertical?: boolean;

    /**
     * 参考系翻转。水平方向默认是相对于页面左边，垂直方向默认是相对于页面上边
     */
    referenceFlip?: boolean;

    className?: string;
}

/**
 * 分隔条。使用前需用css确定好分隔条的位置
 */
export class Splitter extends ObservableComponent<SplitterPropsType> {

    private _splitter: HTMLDivElement;
    private _id = Math.trunc(Math.random() * 10000).toString();
    private _on_mousemove = `mousemove._${this._id}`;
    private _off_mousemove = `mouseenter._${this._id} mouseleave._${this._id} mouseup._${this._id}`;

    componentDidMount() {
        const { position, deviation = 0, vertical, referenceFlip } = this.props;

        $(this._splitter).on('mousedown', () => {
            $(document.body).css('cursor', vertical ? 's-resize' : 'w-resize');
            $(document).on(this._on_mousemove, throttle((e: JQuery.Event) => {
                if (vertical) {
                    const { clientY: point = 0 } = e;
                    position.value = (referenceFlip ? document.body.clientHeight - point : point) - deviation;
                } else {
                    const { clientX: point = 0 } = e;
                    position.value = (referenceFlip ? document.body.clientWidth - point : point) - deviation;
                }
            }, 5));
        });

        $(document).on(this._off_mousemove, () => {
            $(document.body).css('cursor', '');
            $(document).off(this._on_mousemove);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $(this._splitter).off('mousedown');
        $(document.body).css('cursor', '');
        $(document).off(this._off_mousemove);
    }

    render() {
        return <div className={this.props.className} ref={e => this._splitter = e as any}
            style={{ cursor: this.props.vertical ? 's-resize' : 'w-resize' }} />;
    }
}