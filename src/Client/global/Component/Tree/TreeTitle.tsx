import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { TreeTitlePropsType } from './TreePropsType';

const less = require('./Tree.less');

/**
 * 每一级树的标题
 */
export class TreeTitle extends ObservableComponent<TreeTitlePropsType> {

    componentDidMount() {
        this.watch(this.props.loading, this.props.openedBranch);
    }

    render() {
        return (
            <div className={less.TreeTitle} style={{ marginLeft: 10 * this.props.level, width: `calc(100% - ${10 * this.props.level}px)` }}>
                {this.props.isBranch && this.props.loading.size === 0 &&
                    <i className={classnames(less.titleArrow, 'iconfont',
                        this.props.openedBranch.has(this.props.fullName) ? "icon-arrowdroprightdown" : "icon-arrow_right")} />}
                {this.props.loading.size > 0 && <i className={less.titleLoading} />}
                <div className={less.titleItemBox}>{this.props.renderItem()}</div>
            </div>
        );
    }
}