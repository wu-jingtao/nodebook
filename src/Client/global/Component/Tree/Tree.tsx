import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableSet, oSet, oArr, oVar } from 'observable-variable';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { permanent_oSet } from '../../Tools/PermanentVariable';
import { TreePropsType, DataTree } from './TreePropsType';

const less = require('./Tree.less');

/**
 * 树状列表
 */
export abstract class Tree extends ObservableComponent<TreePropsType> {

    //#region 属性

    /**
     * 根
     */
    readonly _root = this.props.root || this;

    /**
     * 数据树
     */
    readonly _dataTree: DataTree = this.props.dataTree || this._root._dataTree;

    /**
     * 打开的分支。值是全路径字符串
     */
    readonly _openedBranch: ObservableSet<string> = this._root._openedBranch || permanent_oSet(`ui.Tree.${this.props.uniqueID}`);

    /**
     * 聚焦到特定的子项上，该子项高亮显示。值是全路径字符串
     */
    readonly _focusedItem: ObservableSet<string> = this._root._focusedItem || oSet([]);

    /**
     * 当前项的名称
     */
    readonly _name = this.props.fullName[this.props.fullName.length - 1];

    /**
     * 当前项的完整名称
     */
    readonly _fullName = this.props.fullName.join('');

    /**
     * 当前项在数据树中对应的数据
     */
    readonly _data: DataTree = this._dataTree;

    /**
     * 是否显示加载动画。如果数组长度大于1则显示
     */
    readonly _loading = oArr<any>([]);

    /**
     * 鼠标是否位于当前节点之上
     */
    readonly _hover = oVar(false);

    constructor(props: any, context: any) {
        super(props, context);

        for (let index = 1; index < this.props.fullName.length; index++) {  //找出当前节点在数据树中对应的数据
            this._data = (this._data.subItem as any).get(this.props.fullName[index]);
        }
    }

    componentDidMount() {
        this.watch(this._focusedItem, this._hover);
    }

    //#endregion

    /**
     * 当程序要展开子项的时候触发的回调。要取消展开则返回false
     */
    abstract async _onOpenBranch(): Promise<void | false>;

    /**
     * 渲染当前项目
     */
    abstract _renderItem(): JSX.Element;

    /**
     * 点击后选中当前项
     */
    _onClick(e: React.MouseEvent<HTMLDivElement>) {
        e.stopPropagation();

        if (e.button === 0) { //鼠标左键

            //获取焦点
            if (e.ctrlKey) { //是否按下了Ctrl键
                if (this._focusedItem.has(this._fullName))
                    this._focusedItem.delete(this._fullName);
                else
                    this._focusedItem.add(this._fullName);
            } else {
                this._focusedItem.clear();
                this._focusedItem.add(this._fullName);
            }

            //展开或收起分支
            if (this._data.subItem) {
                if (this._openedBranch.has(this._fullName))
                    this._openedBranch.delete(this._fullName);
                else
                    this._openedBranch.add(this._fullName);
            }
        }
    }

    render() {
        return (
            <div className={classnames(less.Tree, {
                [less.treeFocus]: this._focusedItem.has(this._fullName),
                [less.treeHover]: this._hover.value
            })}
                onClick={this._onClick.bind(this)}
                onMouseOver={e => { this._hover.value = true; e.stopPropagation(); }}
                onMouseOut={e => { this._hover.value = false; e.stopPropagation(); }}>
                <TreeTitle tree={this} />
                <TreeSubItem tree={this} />
            </div>
        );
    }
}

/**
 * 每一级树的标题
 */
class TreeTitle extends ObservableComponent<{ tree: Tree }> {

    componentDidMount() {
        this.watch(this.props.tree._loading, this.props.tree._openedBranch);
    }

    render() {
        return (
            <div className={less.TreeTitle} style={{
                marginLeft: 10 * this.props.tree.props.fullName.length,
                width: `calc(100% - ${10 * this.props.tree.props.fullName.length}px)`,
            }}>
                {this.props.tree._data.subItem && this.props.tree._loading.length === 0 &&
                    <i className={classnames(less.titleArrow, 'iconfont',
                        this.props.tree._openedBranch.has(this.props.tree._fullName) ? "icon-arrowdroprightdown" : "icon-arrow_right")} />}
                {this.props.tree._loading.length > 0 && <i className={less.titleLoading} />}
                <div className={less.titleItemBox}>{this.props.tree._renderItem()}</div>
            </div>
        );
    }
}

/**
 * 子级
 */
class TreeSubItem extends ObservableComponent<{ tree: Tree }> {

    componentDidMount() {
        if (this.props.tree._data.subItem)
            this.watch(this.props.tree._data.subItem, this.props.tree._openedBranch);
    }

    render() {
        if (this.props.tree._data.subItem && this.props.tree._openedBranch.has(this.props.tree._fullName)) {
            const subItem: JSX.Element[] = [];
            const data = [...this.props.tree._data.subItem.values()];

            const branch = data.filter(item => item.subItem !== undefined).sort((a, b) => a.name.localeCompare(b.name));
            const items = data.filter(item => item.subItem === undefined).sort((a, b) => a.name.localeCompare(b.name));

            branch.forEach(item => subItem.push(React.createElement(this.props.tree.constructor as any,
                { root: this.props.tree, fullName: [...this.props.tree.props.fullName, item.name], key: item.name })));

            items.forEach(item => subItem.push(React.createElement(this.props.tree.constructor as any,
                { root: this.props.tree, fullName: [...this.props.tree.props.fullName, item.name], key: item.name })));

            return subItem;
        } else
            return false;
    }
}