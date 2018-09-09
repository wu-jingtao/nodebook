import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableSet, ObservableVariable, ObservableMap, oSet, oVar, oMap } from 'observable-variable';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { permanent_oSet } from '../../Tools/PermanentVariable';
import { TreePropsType, DataTree } from './TreePropsType';
import { TreeTitle } from './TreeTitle';
import { TreeSubItem } from './TreeSubItem';
import { ContextMenuItemOptions } from '../../../module/ContextMenu/ContextMenuOptions';
import { showContextMenu } from '../../../module/ContextMenu/ContextMenu';

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
     * 打开的分支。值是全路径字符串。不要直接修改该属性
     */
    protected readonly _openedBranch: ObservableSet<string> = this._root._openedBranch || permanent_oSet(`ui.Tree.${this.props.uniqueID}`);

    /**
     * 聚焦到特定的子项上，该子项高亮显示。值是子项的对象
     */
    protected readonly _focusedItem: ObservableSet<Tree> = this._root._focusedItem || oSet([]);

    /**
     * 鼠标是否位于哪个节点之上
     */
    protected readonly _hoveredItem: ObservableVariable<Tree | undefined> = this._root._hoveredItem || oVar(undefined);

    /**
     * 项目的对象列表
     */
    protected readonly _treeObject: ObservableMap<string, Tree> = this._root._treeObject || oMap([]);

    //#endregion

    //#region 当前节点上面的属性

    /**
     * 当前项的名称
     */
    protected readonly _name = this.props.fullName[this.props.fullName.length - 1];

    /**
     * 当前项的完整名称
     */
    protected readonly _fullName = this.props.fullName;

    /**
     * 当前项的完整名称字符串
     */
    protected readonly _fullNameString = this.props.fullName.join('/');

    /**
     * 当前项在数据树中对应的数据
     */
    protected readonly _data: DataTree = this._dataTree;

    /**
     * 是否显示加载动画。如果数组长度大于1则显示
     */
    protected readonly _loading = oSet<any>([]);

    /**
     * 右键菜单
     */
    protected readonly _contextMenu: ContextMenuItemOptions = [];

    //#endregion

    //#region 私有方法

    /**
     * 点击后选中当前项
     */
    private readonly _onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 0) { //鼠标左键
            if (e.ctrlKey) { //是否按下了Ctrl键
                if (this._focusedItem.has(this))
                    this._focusedItem.delete(this);
                else
                    this._focusedItem.add(this);
            } else {
                this._focusedItem.clear();
                this._focusedItem.add(this);

                this.openOrCloseBranch();

                if (this._data.subItem === undefined) { //确保不是分支
                    if (!this._loading.has('_onOpenItem')) { //确保不重复打开
                        this._loading.add('_onOpenItem');
                        this._onOpenItem().then(() => {
                            this._loading.delete('_onOpenItem');
                        });
                    }
                }
            }
        } else if (e.button === 2) //鼠标右键
            if (this._contextMenu.length > 0)
                showContextMenu({ position: { x: e.clientX, y: e.clientY }, items: this._contextMenu });
    }

    /**
     * 当前元素获得焦点
     */
    private readonly _onMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        this._hoveredItem.value = this;
    };

    /**
     * 所有元素失去焦点。只有根才有
     */
    private readonly _onMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        this._hoveredItem.value = undefined;
    };

    //#endregion

    //#region 继承方法

    /**
     * 可向当前树附加额外的属性
     */
    protected abstract _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>): React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

    /**
     * 渲染当前项目
     */
    protected abstract _renderItem(): JSX.Element;

    /**
     * 当程序要展开子项的时候触发的回调。isOpen判断是打开还是关闭，打开true。要阻止则返回false
     */
    protected abstract async _onOpenBranch(isOpen: boolean): Promise<void | false>;

    /**
     * 当点击当前项后触发的打开事件
     */
    protected abstract async _onOpenItem(): Promise<void>;

    //#endregion

    //#region 公开的方法

    /**
     * 展开或关闭分支。isOpen，是打开还是关闭。如果不传递isOpen，那么现在如果是打开则关闭，如果是关闭则打开
     */
    async openOrCloseBranch(isOpen?: boolean): Promise<void> {
        if (this._data.subItem) {   //确保是目录
            if (!this._loading.has('_onOpenBranch')) {  //确保并未处于正在打开或关闭的状态
                this._loading.add('_onOpenBranch'); //表示正在打开

                isOpen = isOpen !== undefined ? isOpen : !this._openedBranch.has(this._fullNameString);

                const result = await this._onOpenBranch(isOpen);

                if (result === false) {
                    if (isOpen)
                        this._openedBranch.delete(this._fullNameString);
                    else
                        this._openedBranch.add(this._fullNameString);
                } else {
                    if (isOpen)
                        this._openedBranch.add(this._fullNameString);
                    else
                        this._openedBranch.delete(this._fullNameString);
                }

                this._loading.delete('_onOpenBranch');
            }
        }
    }

    /**
     * 清除所有焦点项目
     */
    unfocus(): void {
        this._focusedItem.clear();
    }

    /**
     * 取消hover
     */
    unhover(): void {
        this._hoveredItem.value = undefined;
    }

    /**
     * 关闭所有打开的分支
     */
    async closeAllBranch(): Promise<void> {
        //按照路径长度从大到小排序
        const paths = [...this._openedBranch.values()].sort((a, b) => b.length - a.length);

        for (const item of paths) {
            const obj = this._treeObject.get(item);
            if (obj)
                await obj.openOrCloseBranch(false);
        }

        this._openedBranch.clear();
    }

    //#endregion

    constructor(props: any, context: any) {
        super(props, context);

        this._treeObject.set(this._fullNameString, this);

        for (let index = 1; index < this.props.fullName.length; index++) {  //找出当前节点在数据树中对应的数据
            this._data = (this._data.subItem as any).get(this.props.fullName[index]);
        }

        this.openOrCloseBranch(this._openedBranch.has(this._fullNameString)); //检查上次是否打开过该节点
    }

    componentDidMount() {
        this.watch(this._focusedItem, this._hoveredItem);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._treeObject.delete(this._fullNameString);
    }

    render() {
        const props = this._props({
            className: classnames(less.Tree, {
                [less.treeFocus]: this._focusedItem.has(this),
                [less.treeHover]: this._hoveredItem.value === this
            }),
            onClick: this._onClick,
            onMouseOver: this._onMouseOver,
            onMouseLeave: this.props.root === undefined ? this._onMouseLeave : undefined
        });

        return (
            <div {...props}>
                <TreeTitle
                    loading={this._loading}
                    openedBranch={this._openedBranch}
                    level={this._fullName.length}
                    isBranch={this._data.subItem !== undefined}
                    fullNameString={this._fullNameString}
                    renderItem={this._renderItem.bind(this)} />
                <TreeSubItem
                    loading={this._loading}
                    openedBranch={this._openedBranch}
                    data={this._data}
                    fullName={this._fullName}
                    fullNameString={this._fullNameString}
                    element={this.constructor}
                    root={this._root} />
            </div >
        );
    }
}
