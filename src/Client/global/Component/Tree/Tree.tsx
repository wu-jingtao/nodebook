import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableSet, ObservableVariable, oSet, oVar, oMap } from 'observable-variable';

import { ObservableComponent, ObservableComponentWrapper } from '../../Tools/ObservableComponent';
import { ContextMenuItemOptions } from '../../../module/ContextMenu/ContextMenuOptions';
import { showContextMenu } from '../../../module/ContextMenu/ContextMenu';
import { TreePropsType, DataTree } from './TreePropsType';

const less = require('./Tree.less');

export abstract class Tree<P = {}, D = any> extends ObservableComponent<TreePropsType<D> & P> {

    //#region 属性

    /**
     * 判断是不是根节点
     */
    protected readonly _isRoot: boolean = this.props._root === undefined;

    /**
     * 根
     */
    protected readonly _root: this = this.props._root as any || this;

    /**
     * 父级，根的父级为空
     */
    protected readonly _parent?: this = this.props._parent as any;

    /**
     * 当前项的名称
     */
    protected readonly _name: string = this.props.name;

    /**
     * 当前项的完整名称
     */
    protected readonly _fullName: ReadonlyArray<string> = this._parent ? [...this._parent._fullName, this._name] : [this._name];

    /**
     * 当前项的完整名称字符串
     */
    protected readonly _fullNameString: string = this._fullName.join('/');

    /**
     * 当前节点所对应的数据
     */
    protected readonly _dataTree: DataTree<D> = this.props._dataTree as any || { name: this._name, data: {}, subItem: oMap([]) };

    /**
     * 打开的分支。值是全路径字符串。不要直接修改该属性，要打开某个分支请使用openOrCloseBranch()
     */
    protected readonly _openedBranch: ObservableSet<string> = this._root._openedBranch || oSet([]);

    /**
     * 聚焦到特定的子项上，该子项高亮显示。
     */
    protected readonly _focusedItem: ObservableSet<this> = this._root._focusedItem || oSet([]);

    /**
     * 鼠标是否位于哪个节点之上
     */
    protected readonly _hoveredItem: ObservableVariable<this | undefined> = this._root._hoveredItem || oVar(undefined);

    /**
     * 树每个节点的对象列表，key是每个节点的_fullNameString
     */
    protected readonly _treeList: Map<string, this> = this._root._treeList || new Map;

    /**
     * 是否显示加载动画。如果数组长度大于1则显示
     */
    protected readonly _loading = oSet<any>([]);

    UNSAFE_componentWillMount() {
        this.watch(this._focusedItem, this._hoveredItem);

        this._treeList.set(this._fullNameString, this);

        //打开上次打开过的分支
        this._openOrCloseBranch(this._openedBranch.has(this._fullNameString));
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._treeList.delete(this._fullNameString);
    }

    //#endregion

    //#region 私有方法

    /**
     * 当前项的点击事件
     */
    private readonly _onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 0) { //鼠标左键
            //配置焦点
            if (e.ctrlKey) { //是否按下了Ctrl键
                if (this._focusedItem.has(this))
                    this._focusedItem.delete(this);
                else
                    this._focusedItem.add(this);
            } else {
                this._focusedItem.clear();
                this._focusedItem.add(this);

                //打开分支
                this._openOrCloseBranch();

                //触发打开事件
                if (this._dataTree.subItem === undefined) {  //确保不是分支
                    if (!this._loading.has('_onOpenItem')) { //确保不重复打开
                        this._loading.add('_onOpenItem');
                        this._onOpenItem().then(() => {
                            this._loading.delete('_onOpenItem');
                        });
                    }
                }
            }
        }
    }

    /**
     * 右键菜单
     */
    private readonly _original_onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 2) { //鼠标右键 右键菜单
            let menuNumber = 0;

            //过滤void和false
            const items: ContextMenuItemOptions[][] = [];

            this._onContextMenu().forEach(item => {
                const result = item.filter(item => item);

                if (result.length > 0) {
                    menuNumber += result.length;
                    items.push(result as any);
                }
            });

            if (menuNumber > 0)
                showContextMenu({ position: { x: e.clientX, y: e.clientY }, items });
        }
    };

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

    /**
     * 渲染每一级树的标题。
     * 需要观察 _loading, _openedBranch
     */
    private readonly _renderTreeTitle = () => {
        return (
            <div className={less.TreeTitle} style={{ marginLeft: 20 * this._fullName.length, width: `calc(100% - ${20 * this._fullName.length}px)` }}>
                {this._dataTree.subItem && this._loading.size === 0 &&
                    <i className={classnames(less.titleArrow, 'iconfont',
                        this._openedBranch.has(this._fullNameString) ? "icon-arrowdroprightdown" : "icon-arrow_right")} />}
                {this._loading.size > 0 && <i className={less.titleLoading} />}
                <div className={less.titleItemBox}>
                    {this._renderItem()}
                </div>
            </div>
        );
    };

    /**
     * 渲染当前节点的子分支
     * 需要观察 _dataTree.subItem, _loading, _openedBranch
     */
    private readonly _renderTreeBranch = () => {
        if (!this._loading.has('_onOpenBranch') && this._openedBranch.has(this._fullNameString)) {
            const subItem: JSX.Element[] = [];
            const data: DataTree<D>[] = [...(this._dataTree.subItem as any).values()];

            const branch = data.filter(item => item.subItem !== undefined).sort((a, b) => a.name.localeCompare(b.name));
            const items = data.filter(item => item.subItem === undefined).sort((a, b) => a.name.localeCompare(b.name));

            branch.forEach(item => subItem.push(React.createElement(this.constructor as any,
                { _root: this._root, _parent: this, _dataTree: item, name: item.name, key: item.name })));

            items.forEach(item => subItem.push(React.createElement(this.constructor as any,
                { _root: this._root, _parent: this, _dataTree: item, name: item.name, key: item.name })));

            return subItem;
        } else
            return false;
    }

    //#endregion

    //#region 继承方法

    /**
     * 可向当前节点加额外的属性
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

    /**
     * 显示右键菜单
     */
    protected abstract _onContextMenu(): (ContextMenuItemOptions | void | false)[][];

    //#endregion

    //#region 公开的方法

    /**
     * 展开或关闭分支。isOpen，是打开还是关闭。如果不传递isOpen，那么现在如果是打开则关闭，如果是关闭则打开
     */
    protected async _openOrCloseBranch(isOpen?: boolean): Promise<void> {
        if (this._dataTree.subItem) {   //确保是目录
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
            const obj = this._treeList.get(item);
            if (obj) await obj._openOrCloseBranch(false);
        }

        this._openedBranch.clear();
    }

    //#endregion

    render() {
        const props = this._props({
            className: classnames(less.Tree, {
                [less.treeFocus]: this._focusedItem.has(this),
                [less.treeHover]: this._hoveredItem.value === this
            }),
            onClick: this._onClick,
            onContextMenu: this._original_onContextMenu,
            onMouseOver: this._onMouseOver,
            onMouseLeave: this._isRoot ? this._onMouseLeave : undefined
        });

        return (
            <div {...props}>
                <ObservableComponentWrapper watch={[this._loading, this._openedBranch]} render={this._renderTreeTitle} />
                {this._dataTree.subItem &&
                    <ObservableComponentWrapper watch={[this._dataTree.subItem, this._loading, this._openedBranch]} render={this._renderTreeBranch} />}
            </div>
        );
    }
}
