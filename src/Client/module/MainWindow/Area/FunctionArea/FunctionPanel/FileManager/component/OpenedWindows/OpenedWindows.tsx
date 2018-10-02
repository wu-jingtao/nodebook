import * as React from 'react';
import * as classnames from 'classnames';
import clipboard = require('copy-text-to-clipboard');

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { FoldableContainerPropsType } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { ObservableComponent } from '../../../../../../../../global/Tools/ObservableComponent';
import { getIconPath } from '../../../../../../../../global/Component/FileIcon/GetIconPath';
import { dragText } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { showContextMenu } from '../../../../../../../ContextMenu/ContextMenu';
import { ContextMenuItemOptions } from '../../../../../../../ContextMenu/ContextMenuOptions';
import { windowList, closeAllWindow, closeWindow, closeOtherWindow, moveToOtherSide, focusWindow } from '../../../../../ContentWindow/WindowList';
import { WindowArgs, WindowType } from '../../../../../ContentWindow/ContentWindowTypes';

const less = require('./OpenedWindows.less');

/**
 * 打开的窗口
 */
export class OpenedWindows extends FoldableContainer<FoldableContainerPropsType>  {

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="关闭全部窗口" src="/static/res/img/buttons_icon/closeall_inverse.svg" onClick={() => closeAllWindow()} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        let windowLeft, windowRight;

        if (windowList.leftWindows.windowList.length > 0) {
            windowLeft = (
                <>
                    {windowList.rightWindows.windowList.length > 0 &&
                        <div className={less.windowSideTitle}>
                            <span>左侧</span>
                            <img title="关闭左侧窗口" src="/static/res/img/buttons_icon/closeall_inverse.svg" onClick={() => closeAllWindow('left')} />
                        </div>
                    }
                    {windowList.leftWindows.windowList.map(item => <OpenedWindowItem key={item.id} args={item} side="left" />)}
                </>
            );
        }

        if (windowList.rightWindows.windowList.length > 0) {
            windowRight = (
                <>
                    {
                        windowList.leftWindows.windowList.length > 0 &&
                        <div className={less.windowSideTitle}>
                            <span>右侧</span>
                            <img title="关闭右侧窗口" src="/static/res/img/buttons_icon/closeall_inverse.svg" onClick={() => closeAllWindow('right')} />
                        </div>
                    }
                    {windowList.rightWindows.windowList.map(item => <OpenedWindowItem key={item.id} args={item} side="right" />)}
                </>
            );
        }

        return <>{windowLeft}{windowRight}</>;
    }

    componentDidMount() {
        super.componentDidMount();
        this.watch([windowList.leftWindows.windowList, windowList.rightWindows.windowList]);
    }

    render() {
        this._titleBarStyle.display = windowList.leftWindows.windowList.length === 0 &&
            windowList.rightWindows.windowList.length === 0 ? 'none' : '';

        return super.render();
    }
}

class OpenedWindowItem extends ObservableComponent<{ side: 'left' | 'right', args: WindowArgs }>{

    private readonly _thisSide = this.props.side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    //窗口图标
    private readonly _iconPath = '/static/res/img/file_icons/' + getIconPath(
        this.props.args.type === WindowType.task ? '.volt' : //闪电符号
            this.props.args.type === WindowType.service ? '.apib' : //圆圈三角形
                this.props.args.type === WindowType.settings ? '.plist' : //齿轮
                    (this.props.args as any).args.path.split('/').pop()
    );

    //右键菜单
    private readonly _contextMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 2) {
            const items: ContextMenuItemOptions[][] = [
                [
                    { name: '关闭窗口', callback: () => closeWindow(this.props.args.id, this.props.side) },
                    { name: '关闭其他窗口', callback: () => closeOtherWindow(this.props.args.id, this.props.side) },
                ],
                [
                    {
                        name: `移动到${this.props.side === 'left' ? '右' : '左'}侧显示`,
                        callback: () => moveToOtherSide(this.props.args.id, this.props.side)
                    },
                ],
            ];

            if (this.props.args.args && this.props.args.args.path)
                items.push(
                    [
                        {
                            name: '复制绝对路径',
                            callback: () => {
                                if (!clipboard((this.props.args as any).args.path)) {
                                    showMessageBox({
                                        icon: 'message', title: '复制绝对路径失败，请手动复制',
                                        content: (this.props.args as any).args.path, autoClose: 0
                                    });
                                }
                            }
                        }
                    ]
                );

            showContextMenu({ position: { x: e.clientX, y: e.clientY }, items });
        }
    }

    //拖拽
    private readonly _onDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'copy';

        dragText.text((this.props.args as any).args.path);
        e.dataTransfer.setDragImage(dragText[0], -20, 0);

        //配置数据
        e.dataTransfer.setData('text/plain', (this.props.args as any).args.path);
    };

    componentDidMount() {
        this.watch([this.props.args.fixed, windowList.focusedSide, this._thisSide.displayOrder]);
    }

    render() {
        return (
            <div className={classnames(less.contentItem, {
                [less.focused]: windowList.focusedSide.value === this.props.side &&
                    this._thisSide.displayOrder.last === this.props.args.id,
                [less.fixed]: this.props.args.fixed.value
            })}
                draggable={this.props.args.args && this.props.args.args.path ? true : false}
                onDragStart={this._onDragStart}
                onClick={() => focusWindow(this.props.args.id, this.props.side)}
                onDoubleClick={() => this.props.args.fixed.value = true}
                onContextMenu={this._contextMenu}>
                <div className={less.close} title="关闭窗口"
                    onClick={() => closeWindow(this.props.args.id, this.props.side)}>×</div>
                <img className={less.fileIcon} src={this._iconPath} />
                <div className={less.fileName}>{this.props.args.name}</div>
                {this.props.args.args && this.props.args.args.path &&
                    <div className={less.fileFullName}>{this.props.args.args.path}</div>}
            </div>
        );
    }
}