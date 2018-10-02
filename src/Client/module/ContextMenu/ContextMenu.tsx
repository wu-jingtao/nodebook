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
        this.watch([data]);
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
            //计算高度
            let height = 0;

            //显示内容
            const content = data.value.items.map((group, index) => {
                height += 3 + 3 + 1;    //上下padding + 边框

                return (
                    <div className={less.menuGroup} key={index}>
                        {group.map((item, index) => {
                            height += 25;   //高度25

                            return (
                                <div className={less.menuItem} key={index} onClick={item.callback}>
                                    <span>{item.name}</span>
                                    {item.tip && <span className={less.itemTip}>{item.tip}</span>}
                                </div>
                            );
                        })}
                    </div>
                )
            });

            let position;   //计算是显示在鼠标的下方还是上方
            if (data.value.position.y + height < window.innerHeight)
                position = { top: `${data.value.position.y + 2}px`, left: `${data.value.position.x + 2}px` };
            else
                position = { top: `${data.value.position.y - height - 2}px`, left: `${data.value.position.x + 2}px` };

            return (
                <div id="ContextMenu" style={position}>
                    {content}
                </div>
            );
        } else
            return false;
    }
}