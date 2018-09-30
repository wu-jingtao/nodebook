import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';
import clipboard = require('copy-text-to-clipboard');

import { FoldableContainer } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { FoldableContainerPropsType } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { ObservableComponent } from '../../../../../../../../global/Tools/ObservableComponent';
import { FileIcon } from '../../../../../../../../global/Component/FileIcon/FileIcon';
import { dragText } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { windowList, closeWindow, moveToOtherSide } from '../../../../../ContentWindow/ContentWindow';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { showContextMenu } from '../../../../../../../ContextMenu/ContextMenu';

const less = require('./OpenedWindows.less');

/**
 * 打开的窗口
 */
export class OpenedWindows extends FoldableContainer<FoldableContainerPropsType>  {

    //关闭所有窗口
    private readonly _closeAll = () => {
        windowList.focusedWindow.value = null;
        windowList.leftWindows.length = 0;
        windowList.rightWindows.length = 0;
    };

    //关闭所有左侧窗口
    private readonly _closeLeft = () => {
        windowList.leftWindows.length = 0;
    };

    //关闭所有右侧窗口
    private readonly _closeRight = () => {
        windowList.rightWindows.length = 0;
    };

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <img title="关闭全部窗口" src="/static/res/img/buttons_icon/closeall_inverse.svg" onClick={this._closeAll} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        let windowLeft, windowRight;

        if (windowList.leftWindows.length > 0) {
            windowLeft = (
                <>
                    {windowList.rightWindows.length > 0 &&
                        <div className={less.windowSideTitle}>
                            <span>左侧</span>
                            <img title="关闭左侧窗口" src="/static/res/img/buttons_icon/closeall_inverse.svg" onClick={this._closeLeft} />
                        </div>
                    }
                    {windowList.leftWindows.map(item =>
                        <OpenedWindowItem key={`${item.type}-${item.name}`} name={item.name} type={item.type} fixed={item.fixed} side="left" />)}
                </>
            );
        }

        if (windowList.rightWindows.length > 0) {
            windowRight = (
                <>
                    {
                        windowList.leftWindows.length > 0 &&
                        <div className={less.windowSideTitle}>
                            <span>右侧</span>
                            <img title="关闭右侧窗口" src="/static/res/img/buttons_icon/closeall_inverse.svg" onClick={this._closeRight} />
                        </div>
                    }
                    {windowList.rightWindows.map(item =>
                        <OpenedWindowItem key={`${item.type}-${item.name}`} name={item.name} type={item.type} fixed={item.fixed} side="right" />)}
                </>
            );
        }

        return <>{windowLeft}{windowRight}</>;
    }

    componentDidMount() {
        super.componentDidMount();
        this.watch(windowList.leftWindows, windowList.rightWindows);
    }

    render() {
        this._titleBarStyle.display = windowList.leftWindows.length === 0 && windowList.rightWindows.length === 0 ? 'none' : '';
        return super.render();
    }
}

class OpenedWindowItem extends ObservableComponent<{ side: 'left' | 'right', name: string, type: 'file' | 'task' | 'service' | 'setting', fixed: ObservableVariable<boolean> }>{

    //窗口名称
    private readonly _name = this.props.type === 'file' ? this.props.name.split('/').pop() as string : this.props.name;

    //窗口图标
    private readonly _icon = this.props.type === 'file' ? this._name :
        this.props.type === 'task' ? '.volt' : //闪电符号
            this.props.type === 'service' ? '.apib' : //圆圈三角形
                '.plist' //setting 齿轮

    //复制当前文件的绝对路径
    private readonly _menu_copyPath = () => {
        if (this.props.type === 'file') {
            if (!clipboard(this.props.name)) {
                showMessageBox({ icon: 'message', title: '复制绝对路径失败，请手动复制', content: this.props.name, autoClose: 0 });
            }
        }
    };

    //关闭窗口
    private readonly _menu_close = () => {
        closeWindow({ name: this.props.name, type: this.props.type, side: this.props.side });
    };

    //将窗口移动到另一边显示
    private readonly _menu_moveToOtherSide = () => {
        moveToOtherSide({ name: this.props.name, type: this.props.type, side: this.props.side });
    };

    //使得当前窗口处于焦点
    private readonly _focusWindow = () => {
        windowList.focusedWindow.value = { name: this.props.name, type: this.props.type, side: this.props.side };
    };

    //使得窗口固定
    private readonly _fixWindow = () => {
        this.props.fixed.value = true;
    }

    //右键菜单
    private readonly _contextMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.button === 2) {
            showContextMenu({
                position: { x: e.clientX, y: e.clientY }, items: [
                    [
                        { name: '关闭窗口', callback: this._menu_close },
                        { name: `移动到${this.props.side === 'left' ? '右' : '左'}侧显示`, callback: this._menu_moveToOtherSide }
                    ],
                    [
                        { name: '复制绝对路径', callback: this._menu_copyPath }
                    ]
                ]
            });
        }
    }

    //拖拽
    private readonly _onDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'copy';

        dragText.text(this._name);
        e.dataTransfer.setDragImage(dragText[0], -20, 0);

        //配置数据
        e.dataTransfer.setData('text/plain', this.props.name);
    };

    componentDidMount() {
        this.watch(this.props.fixed, windowList.focusedWindow);
    }

    render() {
        const focused = windowList.focusedWindow.value &&
            windowList.focusedWindow.value.side === this.props.side &&
            windowList.focusedWindow.value.type === this.props.type &&
            windowList.focusedWindow.value.name === this.props.name;

        return (
            <div className={classnames(less.contentItem, { [less.focused]: focused, [less.fixed]: this.props.fixed.value })}
                draggable
                onDragStart={this._onDragStart}
                onClick={this._focusWindow}
                onDoubleClick={this._fixWindow}
                onContextMenu={this._contextMenu}>
                <div className={less.close} title="关闭窗口" onClick={this._menu_close}>×</div>
                <FileIcon className={less.fileIcon} filename={this._icon} />
                <div className={less.fileName}>{this._name}</div>
                {this.props.type === 'file' && <div className={less.fileFullName}>{this.props.name}</div>}
            </div>
        );
    }
}