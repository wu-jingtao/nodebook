import * as React from 'react';
import * as classnames from 'classnames';
import { oVar, ObservableVariable } from 'observable-variable';

import { permanent_oVar } from '../../Tools/PermanentVariable';
import { ObservableComponent } from '../../Tools/ObservableComponent';
import { ScrollBar } from '../ScrollBar/ScrollBar';
import { FoldableContainerPropsType } from './FoldableContainerPropsType';

const less = require('./FoldableContainer.less');

export abstract class FoldableContainer<T extends FoldableContainerPropsType> extends ObservableComponent<T> {

    public readonly folded: ObservableVariable<boolean> = this.props.folded as any || permanent_oVar(`ui.FoldableContainer.${this.props.uniqueID}`, 'false');

    protected _titleBar_div: JQuery<HTMLDivElement>;
    protected _content_div: JQuery<HTMLDivElement>;

    protected _titleBarClassName: string = '';
    protected _contentClassName: string = '';

    protected _titleBarStyle: React.CSSProperties = {};
    protected _contentStyle: React.CSSProperties = {};

    protected abstract renderTitleBar(): JSX.Element;
    protected abstract renderContent(): JSX.Element;

    constructor(props: any, context: any) {
        super(props, context);

        if (this.props.noFold) {
            this.folded.value = false;
            this.folded.on('beforeSet', () => false);
        }
    }

    componentDidMount() {
        this.watch(this.folded);
    }

    render() {
        return (
            <div className={less.FoldableContainer}>
                <div className={classnames(less.titleBar, this._titleBarClassName)}
                    style={this._titleBarStyle}
                    ref={(e: any) => this._titleBar_div = e && $(e)}
                    onClick={() => this.folded.value = !this.folded.value}>
                    <i style={{ visibility: this.props.noFold ? 'hidden' : 'visible' }}
                        className={classnames(less.icon, 'iconfont', this.folded.value ? "icon-arrow_right" : "icon-arrowdroprightdown")} />
                    <span className={less.title}>{this.props.title}</span>
                    <div className={less.titleBox} style={{ display: this.folded.value ? 'none' : 'block' }}>
                        {this.renderTitleBar()}
                    </div>
                </div>
                <ScrollBar className={classnames(less.content, this._contentClassName)}
                    style={{ ...this._contentStyle, display: this.folded.value ? 'none' : 'block' }}
                    ref={(e: any) => this._content_div = e && $(e)}>
                    {this.renderContent()}
                </ScrollBar>
            </div>
        );
    }
}