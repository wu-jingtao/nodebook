import * as React from 'react';
import throttle = require('lodash.throttle');

import { SplitterPropsType } from './SplitterPropsType';

const less = require('./Splitter.less');

//当拖拽分隔条时遮挡屏幕
const mask = $(`<div class="${less.SplitterMask}"></div>`).appendTo(document.body);

/**
 * 分隔条。使用前需用css确定好分隔条的位置
 */
export class Splitter extends React.PureComponent<SplitterPropsType> {

    private _splitter: JQuery<HTMLDivElement>;
    private _document = $(document);
    private _body = $(document.body);

    private _on_mousemove = `mousemove._${Math.trunc(Math.random() * 10000).toString()}`;
    private _off_mousemove = `mouseenter mouseleave mouseup`;

    componentDidMount() {
        this._splitter.on('mousedown', () => {
            const offset = this._splitter.offset() as any;  //获取分隔条相对于屏幕的位置
            const position = this.props.vertical ? offset.top : offset.left;
            this.props.onChange(position);

            this._body.css('cursor', this.props.vertical ? 's-resize' : 'w-resize');
            mask.show();

            this._document.on(this._on_mousemove, throttle((e: JQuery.Event) => {
                const position = (this.props.vertical ? e.clientY : e.clientX) as any;
                this.props.onChange(position);
            }, 10));

            this._document.one(this._off_mousemove, () => {
                this._document.off(this._on_mousemove);
                this._body.css('cursor', '');
                mask.hide();

                const offset = this._splitter.offset() as any;
                const position = this.props.vertical ? offset.top : offset.left;
                this.props.onChange(position);
            });
        });
    }

    render() {
        return (
            <div className={this.props.className} ref={e => (this._splitter as any) = e && $(e)}
                style={{ ...this.props.style, cursor: this.props.vertical ? 's-resize' : 'w-resize' }} />
        );
    }
}