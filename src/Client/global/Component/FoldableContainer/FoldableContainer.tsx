import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, oVar, permanent_oVar } from 'observable-variable';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { ScrollBar } from '../ScrollBar/ScrollBar';
import { FoldableContainerPropsType } from './FoldableContainerPropsType';

const less = require('./FoldableContainer.less');

export abstract class FoldableContainer<T extends FoldableContainerPropsType> extends ObservableComponent<T> {

    private readonly _titleBarFocused = oVar(false);
    private _isClicked = false; //用于判读是否被鼠标点击了

    public readonly folded: ObservableVariable<boolean> = this.props.folded as any || permanent_oVar(`ui.FoldableContainer.${this.props.uniqueID}`, { defaultValue: false });

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

    private readonly _titleBarOnClick = () => {
        this.folded.value = !this.folded.value;
        this._isClicked = true;
    };

    componentDidMount() {
        this.watch([this.folded, this._titleBarFocused]);

        $(document).on(`click.FoldableContainer.${this.props.uniqueID}`, () => {
            setTimeout(() => {  //慢于_titleBarOnClick执行
                if (this._isClicked) {
                    this._isClicked = false;
                    this._titleBarFocused.value = true;
                } else
                    this._titleBarFocused.value = false;
            }, 1);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $(document).off(`click.FoldableContainer.${this.props.uniqueID}`);
    }

    render() {
        return (
            <div className={less.FoldableContainer}>
                <div className={classnames(less.titleBar, { [less.titleBarFocused]: this._titleBarFocused.value }, this._titleBarClassName)}
                    style={{ ...this._titleBarStyle }}
                    ref={(e: any) => this._titleBar_div = e && $(e)}
                    onClick={this._titleBarOnClick}>
                    <i style={{ visibility: this.props.noFold ? 'hidden' : 'visible' }}
                        className={classnames(less.icon, 'iconfont', this.folded.value ? "icon-arrow_right" : "icon-arrowdroprightdown")} />
                    <span className={less.title}>{this.props.title}</span>
                    <div className={less.titleBox} style={{ display: this.folded.value ? 'none' : '' }}>
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