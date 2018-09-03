import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { permanent_oVar } from '../../Tools/PermanentVariable';
import { ScrollBar } from '../ScrollBar/ScrollBar';
import { FoldableContainerPropsType } from './FoldableContainerPropsType';

const less = require('./FoldableContainer.less');

/**
 * 可折叠容器
 */
export abstract class FoldableContainer extends ObservableComponent<FoldableContainerPropsType> {

    /**
     * 容器是否处于折叠状态
     */
    protected readonly _folded = permanent_oVar(`ui.FoldableContainer.${this.props.uniqueName}._folded`, 'false');

    protected readonly _classNames: string[] = [less.FoldableContainer];

    /**
     * 折叠容器div元素
     */
    protected _ref: JQuery<HTMLDivElement> | null;

    /**
     * 渲染标题栏上的内容
     */
    protected abstract renderTitleBar(): JSX.Element;

    /**
     * 渲染主要内容
     */
    protected abstract renderContent(): JSX.Element;

    componentDidMount() {
        this.watch(this._folded);
    }

    render() {
        return (
            <div className={this._classNames.join(' ')} ref={e => this._ref = e && $(e)}>
                <div className={less.titleBar} onClick={() => this._folded.value = !this._folded.value}>
                    <i className={classnames(less.icon, 'iconfont', this._folded.value ? "icon-arrow_right" : "icon-arrowdroprightdown")} />
                    <span className={less.title}>{this.props.title}</span>
                    <div className={less.titleBox}>
                        {this.renderTitleBar()}
                    </div>
                </div>
                <ScrollBar className={less.content} style={{ display: this._folded.value ? 'none' : 'block' }}>
                    {this.renderContent()}
                </ScrollBar>
            </div>
        );
    }
}