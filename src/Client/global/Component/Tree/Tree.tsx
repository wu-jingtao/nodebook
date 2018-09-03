import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, watch } from 'observable-variable';

const less = require('./Tree.less');

/**
 * 树状列表
 */
export class Tree extends React.PureComponent<{ folded: ObservableVariable<boolean>, className?: string }> {

    protected _ref: JQuery<HTMLDivElement> | null;

    render() {
        return (
            <div className={classnames(less.Tree, this.props.className)} ref={e => this._ref = e && $(e)}>
                {
                    React.Children.map(this.props.children, item => {
                        if (React.isValidElement(item))
                            return React.cloneElement(item, { _folded: this.props.folded } as any);
                        else
                            return item;
                    })
                }
            </div>
        );
    }
}

/**
 * 树状列表的头部
 */
export class TreeTitle extends React.PureComponent<{ className?: string }> {

    private _cancelWatch: Function;
    protected _ref: JQuery<HTMLDivElement> | null;
    public readonly state = { folded: (this.props as any)._folded.value };

    constructor(props: any, context: any) {
        super(props, context);
        this._cancelWatch = watch([(this.props as any)._folded], () => this.setState({ folded: (this.props as any)._folded.value }));
    }

    componentWillUnmount() {
        this._cancelWatch();
    }

    render() {
        return (
            <div className={classnames(less.TreeTitle, this.props.className)} ref={e => this._ref = e && $(e)}>
                <i className={classnames(less.titleIcon, 'iconfont', (this.props as any)._folded.value ? "icon-arrow_right" : "icon-arrowdroprightdown")} />
                <div className={less.treeTitleContent}>{this.props.children}</div>
            </div>
        );
    }
}

/**
 * 树状列表的子项
 */
export class TreeItem extends React.PureComponent<{ className?: string }>{

    private _cancelWatch: Function;
    protected _ref: JQuery<HTMLDivElement> | null;
    public readonly state = { folded: (this.props as any)._folded.value };

    constructor(props: any, context: any) {
        super(props, context);
        this._cancelWatch = watch([(this.props as any)._folded], () => this.setState({ folded: (this.props as any)._folded.value }));
    }

    componentWillUnmount() {
        this._cancelWatch();
    }

    render() {
        return (
            <div className={classnames(less.TreeItem, this.props.className)}
                style={{ display: this.state.folded ? 'none' : 'block' }}
                ref={e => this._ref = e && $(e)}>
                {this.props.children}
            </div>
        );
    }
}