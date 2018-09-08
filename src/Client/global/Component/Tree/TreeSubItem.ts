import * as React from 'react';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { TreeSubItemPropsType } from './TreePropsType';

/**
 * 子级
 */
export class TreeSubItem extends ObservableComponent<TreeSubItemPropsType> {

    componentDidMount() {
        if (this.props.data.subItem)
            this.watch(this.props.data.subItem, this.props.openedBranch, this.props.loading);
    }

    render() {
        if (this.props.data.subItem && !this.props.loading.has('_onOpenBranch') && this.props.openedBranch.has(this.props.fullNameString)) {
            const subItem: JSX.Element[] = [];
            const data = [...this.props.data.subItem.values()];

            const branch = data.filter(item => item.subItem !== undefined).sort((a, b) => a.name.localeCompare(b.name));
            const items = data.filter(item => item.subItem === undefined).sort((a, b) => a.name.localeCompare(b.name));

            branch.forEach(item => subItem.push(React.createElement(this.props.element as any,
                { root: this.props.root, fullName: [...this.props.fullName, item.name], key: item.name })));

            items.forEach(item => subItem.push(React.createElement(this.props.element as any,
                { root: this.props.root, fullName: [...this.props.fullName, item.name], key: item.name })));

            return subItem;
        } else
            return false;
    }
}