import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { ContextMenuOptions } from './ContextMenuOptions';

const less = require('./ContextMenu.less');

const data = oVar<ContextMenuOptions | undefined>(undefined);

/**
 * 显示上下文菜单
 */
export function showContextMenu(options: ContextMenuOptions): void {
    //避免事件循序错乱
    setTimeout(() => data.value = options, 10);
}

/**
 * 右键菜单
 */
export class ContextMenu extends ObservableComponent {

    componentDidMount() {
        this.watch(data);
        $(document).on('click._ContextMenu', () => {
            setTimeout(() => data.value = undefined, 5);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $(document).off('click._ContextMenu');
    }

    render() {
        if (data.value) {
            return (
                <div id="ContextMenu" style={{ top: `${data.value.position.y}px`, left: `${data.value.position.x}px` }}>
                    {data.value.items.map((group, index) => (
                        <div className={less.menuGroup} key={index}>
                            {group.map((item, index) => (
                                <div className={less.menuItem} key={index} onClick={item.callback}>
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        } else
            return false;
    }
}