import * as React from 'react';

import { ObservableComponent } from "../../../../../../../../global/Tools/ObservableComponent";

const less = require('./BaseSettingGroup.less');

/**
 * 设置组的父类
 */
export abstract class BaseSettingGroup extends ObservableComponent {

    /**
     * 当前设置组的名称
     */
    protected abstract _groupName: string;

    /**
     * 当前设置组的介绍
     */
    protected _groupDescription?: string;

    /**
     * 子分组
     */
    protected abstract _subGroup: { name: string, description?: string, items: React.ReactNode[] }[];

    render() {
        return (
            <div className={less.group}>
                <div className={less.groupHeader}>
                    <span>{this._groupName}</span>
                    <span className={less.groupHeaderDescription}>{this._groupDescription || false}</span>
                </div>
                {this._subGroup.map(item => (
                    <div key={item.name} className={less.subGroup}>
                        <div className={less.subGroupHeader}>
                            <span>{item.name}</span>
                            <span className={less.groupHeaderDescription}>{item.description || false}</span>
                        </div>
                        {item.items.map((item, index) => (
                            <div key={index} className={less.groupItem}>{item}</div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }
}