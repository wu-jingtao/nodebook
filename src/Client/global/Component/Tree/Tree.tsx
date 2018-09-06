import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableSet, oSet, oVar, ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { permanent_oSet } from '../../Tools/PermanentVariable';
import { TreePropsType, DataTree } from './TreePropsType';
import { TreeTitle } from './TreeTitle';
import { TreeSubItem } from './TreeSubItem';

const less = require('./Tree.less');

/**
 * 树状列表
 */
export abstract class Tree extends ObservableComponent<TreePropsType> {

    //#region 根上面的属性

    /**
     * 根
     */
    protected readonly _root = this.props.root || this;

    /**
     * 数据树
     */
    protected readonly _dataTree: DataTree = this.props.dataTree || this._root._dataTree;

    /**
     * 打开的分支。值是全路径字符串
     */
    protected readonly _openedBranch: ObservableSet<string> = this._root._openedBranch || permanent_oSet(`ui.Tree.${this.props.uniqueID}`);

    /**
     * 聚焦到特定的子项上，该子项高亮显示。值是全路径字符串
     */
    protected readonly _focusedItem: ObservableSet<string> = this._root._focusedItem || oSet([]);

    /**
     * 鼠标是否位于哪个节点之上
     */
    protected readonly _hoveredItem: ObservableVariable<string> = this._root._hoveredItem || oVar('');

    //#endregion

    //#region 当前节点上面的属性

    /**
     * 当前项的名称
     */
    protected readonly _name = this.props.fullName[this.props.fullName.length - 1];

    /**
     * 当前项的完整名称
     */
    protected readonly _fullName = this.props.fullName.join('');

    /**
     * 当前项在数据树中对应的数据
     */
    protected readonly _data: DataTree = this._dataTree;

    /**
     * 是否显示加载动画。如果数组长度大于1则显示
     */
    protected readonly _loading = oSet<any>([]);

    /**
     * 当前元素的引用
     */
    protected _ref: JQuery<HTMLDivElement>;

    //#endregion

    constructor(props: any, context: any) {
        super(props, context);

        for (let index = 1; index < this.props.fullName.length; index++) {  //找出当前节点在数据树中对应的数据
            this._data = (this._data.subItem as any).get(this.props.fullName[index]);
        }

        this._openOrCloseBranch(true);
    }

    /**
     * 展开或关闭分支。initialOpen 构造方法中使用，用于判断之前该分支是否被打开过，如果打开过，就再次打开
     */
    private _openOrCloseBranch(initialOpen?: boolean): void {
        if (this._data.subItem) {   //确保是目录
            if (!this._loading.has('_onOpenBranch')) {  //确保并未处于正在打开或关闭的状态
                if (initialOpen) {
                    if (this._openedBranch.has(this._fullName)) {
                        this._loading.add('_onOpenBranch');
                        this._onOpenBranch(true).then(result => {
                            if (result === false)
                                this._openedBranch.delete(this._fullName);
                            this._loading.delete('_onOpenBranch');
                        });
                    }
                } else if (this._openedBranch.has(this._fullName)) {
                    this._loading.add('_onOpenBranch');
                    this._onOpenBranch(false).then(result => {
                        if (result !== false)
                            this._openedBranch.delete(this._fullName);
                        this._loading.delete('_onOpenBranch');
                    });
                } else {
                    this._loading.add('_onOpenBranch');
                    this._onOpenBranch(true).then(result => {
                        if (result !== false)
                            this._openedBranch.add(this._fullName);
                        this._loading.delete('_onOpenBranch');
                    });
                }
            }
        }
    }

    /**
     * 点击后选中当前项
     */
    private readonly _onClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

                this._openOrCloseBranch();
            }
        }
    }

    /**
     * 当前元素获得焦点
     */
    private readonly _onMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        this._hoveredItem.value = this._fullName;
    };

    /**
     * 所有元素失去焦点。只有根有
     */
    private readonly _onMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        this._hoveredItem.value = '';
    };

    /**
     * 当程序要展开子项的时候触发的回调。isOpen判断是打开还是关闭，打开true。要取消则返回false
     */
    protected abstract async _onOpenBranch(isOpen: boolean): Promise<void | false>;

    /**
     * 渲染当前项目
     */
    protected abstract _renderItem(): JSX.Element;

    /**
     * 清除所有焦点项目
     */
    unfocus() {
        this._focusedItem.clear();
    }

    /**
     * 取消hover
     */
    unhover() {
        this._hoveredItem.value = '';
    }

    componentDidMount() {
        this.watch(this._focusedItem, this._hoveredItem);
    }

    render() {
        return (
            <div draggable className={classnames(less.Tree, {
                [less.treeFocus]: this._focusedItem.has(this._fullName),
                [less.treeHover]: this._hoveredItem.value === this._fullName
            })}
                onClick={this._onClick}
                onMouseOver={this._onMouseOver}
                onMouseOut={this.props.root && this._onMouseLeave}
                ref={(e: any) => this._ref = e && $(e)}>
                <TreeTitle
                    loading={this._loading}
                    openedBranch={this._openedBranch}
                    level={this.props.fullName.length}
                    isBranch={this._data.subItem !== undefined}
                    fullName={this._fullName}
                    renderItem={this._renderItem.bind(this)} />
                <TreeSubItem
                    loading={this._loading}
                    openedBranch={this._openedBranch}
                    data={this._data}
                    fullName={this.props.fullName}
                    element={this.constructor}
                    root={this._root} />
            </div >
        );
    }
}

