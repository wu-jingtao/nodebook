import * as React from 'react';
import classnames = require('classnames');

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { showContextMenu } from '../../../../../ContextMenu/ContextMenu';
import { windowList, closeWindow, moveToOtherSide } from '../../ContentWindow';
import { Window } from '../../ContentWindowTypes';

const less = require('./BaseWindow.less');

/**
 * 顶部选项卡标题栏
 */
export abstract class BaseWindowTitle extends ObservableComponent<{ window: Window, position: 'left' | 'right' }> {

    /**
     * 图标的文件路径
     */
    protected abstract _icon: string;

    /**
     * 要显示的标题
     */
    protected abstract _title: string;

    /**
     * 鼠标移动到标题上时显示的提示文字
     */
    protected abstract _prompt: string;

    //关闭窗口
    private readonly close_window = (e?: React.MouseEvent) => {
        if (e) {
            if (e.button === 0) {   //确保是左键点击
                e.stopPropagation();
                closeWindow({ name: this.props.window.name, type: this.props.window.type, side: this.props.position });
            }
        } else
            closeWindow({ name: this.props.window.name, type: this.props.window.type, side: this.props.position });
    };

    //使窗口获得焦点
    private focus_window = (e: React.MouseEvent) => {
        if (e.button === 0)
            windowList.focusedWindow.value = { name: this.props.window.name, type: this.props.window.type, side: this.props.position };
    };

    //固定窗口
    private fix_window = (e: React.MouseEvent) => {
        if (e.button === 0)
            this.props.window.fixed.value = true;
    };

    //右键菜单
    private context_menu = (e: React.MouseEvent) => {
        if (e.button === 2) {
            e.preventDefault();
            showContextMenu({
                position: { x: e.clientX, y: e.clientY },
                items: [
                    [
                        { name: '关闭窗口', callback: this.close_window },
                        {
                            name: `${this.props.window.fixed.value ? '取消' : ''}固定窗口`,
                            callback: () => this.props.window.fixed.value = !this.props.window.fixed.value
                        },
                        {
                            name: `移动到${this.props.position === 'left' ? '右' : '左'}侧显示`,
                            callback: () => moveToOtherSide({ name: this.props.window.name, type: this.props.window.type, side: this.props.position })
                        }
                    ]
                ]
            });
        }
    };

    componentDidMount() {
        this.watch(this.props.window.fixed, windowList.focusedWindow);
    }

    render() {
        //是否处于焦点
        const focused = windowList.focusedWindow.value &&
            windowList.focusedWindow.value.side === this.props.position &&
            windowList.focusedWindow.value.type === this.props.window.type &&
            windowList.focusedWindow.value.name === this.props.window.name;

        return (
            <div className={classnames(less.title, {
                [less.titleFocus]: focused,
                [less.titleFixed]: this.props.window.fixed.value
            })}
                title={this._prompt}
                onClick={this.focus_window}
                onDoubleClick={this.fix_window}
                onContextMenu={this.context_menu}>
                <img className={less.titleIcon} src={this._icon} />
                <span className={less.titleText}>{this._title}</span>
                <div className={less.titleCloseButton} onClick={this.close_window}>×</div>
            </div>
        );
    }
}