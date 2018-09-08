import * as React from 'react';

export interface ContextMenuOptions {
    /**
     * 在屏幕上的位置
     */
    position: { x: number, y: number };

    /**
     * 菜单项，通过数组分割菜单组
     */
    items: ContextMenuItemOptions;
}

export type ContextMenuItemOptions = { name: string, callback: React.MouseEventHandler<HTMLDivElement> }[][];