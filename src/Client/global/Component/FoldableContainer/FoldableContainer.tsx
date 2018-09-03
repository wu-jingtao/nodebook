import * as React from 'react';
import * as classnames from 'classnames';
import { oVar } from 'observable-variable';

import { permanent_oVar } from '../../Tools/PermanentVariable';
import { ObservableComponent } from '../../Tools/ObservableComponent';
import { ScrollBar } from '../ScrollBar/ScrollBar';
import { FoldableContainerPropsType } from './FoldableContainerPropsType';

const less = require('./FoldableContainer.less');

export abstract class FoldableContainer<T extends FoldableContainerPropsType> extends ObservableComponent<T> {

    protected readonly _folded = permanent_oVar(`ui.FoldableContainer.${this.props.uniqueID}`,
        this.props.noFold ? 'false' : this.props.folded ? 'true' : 'false');

    protected readonly _hover = oVar(false);  //鼠标是否处于悬浮状态

    protected _titleBar_div: JQuery<HTMLDivElement>;
    protected _content_div: JQuery<HTMLDivElement>;

    protected _titleBarClassName: string;
    protected _contentClassName: string;

    protected abstract renderTitleBar(): JSX.Element;
    protected abstract renderContent(): JSX.Element;

    componentDidMount() {
        this.watch(this._folded, this._hover);
        if (this.props.noFold) this._folded.on('beforeSet', () => false);

        this._titleBar_div.mouseenter(() => this._hover.value = true).mouseleave(() => this._hover.value = false);
        this._content_div.mouseenter(() => this._hover.value = true).mouseleave(() => this._hover.value = false);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._titleBar_div.off('mouseenter mouseleave');
        this._content_div.off('mouseenter mouseleave');
    }

    render() {
        return (
            <>
                <div className={classnames(less.titleBar, this._titleBarClassName)}
                    ref={(e: any) => this._titleBar_div = e && $(e)}
                    onClick={() => this._folded.value = !this._folded.value}>
                    <i style={{ visibility: this.props.noFold ? 'hidden' : 'visible' }}
                        className={classnames(less.icon, 'iconfont', this._folded.value ? "icon-arrow_right" : "icon-arrowdroprightdown")} />
                    <span className={less.title}>{this.props.title}</span>
                    <div className={less.titleBox} style={{ display: !this._folded.value && this._hover.value ? 'block' : 'none' }}>
                        {this.renderTitleBar()}
                    </div>
                </div>
                <ScrollBar className={classnames(less.content, this._contentClassName)}
                    style={{ display: this._folded.value ? 'none' : 'block' }}
                    ref={(e: any) => this._content_div = e && $(e)}>
                    {this.renderContent()}
                </ScrollBar>
            </>
        );
    }
}