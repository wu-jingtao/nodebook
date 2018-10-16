import * as React from 'react';
import { oVar, watch } from 'observable-variable';
import classnames = require('classnames');

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { showContextMenu } from '../../../../../ContextMenu/ContextMenu';
import { WindowArgs } from '../../ContentWindowTypes';
import { focusWindow, moveToOtherSide, closeWindow, windowList, closeOtherWindow } from '../../WindowList';

const less = require('./BaseWindow.less');

/**
 * 顶部选项卡标题栏
 */
export abstract class BaseWindowTitle<T extends WindowArgs> extends ObservableComponent<{ args: T, side: 'left' | 'right', communicator: { [key: string]: any } }> {

    private readonly _thisSide = this.props.side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    //要显示的标题
    private readonly _title = this.props.args.name;
    
    //是否获取到了焦点
    private readonly _focused = oVar(this._thisSide.displayOrder.last === this.props.args.id);

    private _ref: HTMLDivElement;

    /**
     * 图标的文件路径
     */
    protected abstract _icon: string;

    /**
     * 鼠标移动到标题上时显示的提示文字
     */
    protected abstract _prompt: string;

    /**
     * 是否显示加载动画
     */
    protected readonly _loading = oVar(false);

    //关闭窗口
    private readonly close_window = (e: React.MouseEvent) => {
        if (e.button === 0) {
            e.stopPropagation();
            closeWindow(this.props.args.id, this.props.side);
        }
    };

    //使窗口获得焦点
    private focus_window = (e: React.MouseEvent) => {
        if (e.button === 0)
            focusWindow(this.props.args.id, this.props.side);
    };

    //固定窗口
    private fix_window = (e: React.MouseEvent) => {
        if (e.button === 0)
            this.props.args.fixed.value = true;
    };

    //右键菜单
    private context_menu = (e: React.MouseEvent) => {
        if (e.button === 2) {
            e.preventDefault();

            showContextMenu({
                position: { x: e.clientX, y: e.clientY },
                items: [
                    [
                        { name: '关闭窗口', callback: () => closeWindow(this.props.args.id, this.props.side) },
                        { name: '关闭其他窗口', callback: () => closeOtherWindow(this.props.args.id, this.props.side) },
                    ],
                    [
                        {
                            name: `${this.props.args.fixed.value ? '取消' : ''}固定窗口`,
                            callback: () => this.props.args.fixed.value = !this.props.args.fixed.value
                        },
                        {
                            name: `移动到${this.props.side === 'left' ? '右' : '左'}侧显示`,
                            callback: () => moveToOtherSide(this.props.args.id, this.props.side)
                        }
                    ]
                ]
            });
        }
    };

    componentDidMount() {
        this.watch([this.props.args.fixed, this._focused, this._loading]);

        this._unobserve.push(watch([this._thisSide.displayOrder], () => {   //检查是否处于焦点
            this._focused.value = this._thisSide.displayOrder.last === this.props.args.id;
        }));

        //获取到焦点后，使选项卡滑动到可显示区域
        this._focused.on('set', value => {
            const parent = this._ref.parentNode as HTMLDivElement;

            if (value && parent.clientWidth < parent.scrollWidth) { //确保出现滚动条
                const leftOffset = $(this._ref).prevAll().toArray().reduce((pre, item) => item.clientWidth + pre, 0);
                const rightOffset = leftOffset + this._ref.clientWidth;

                if (parent.scrollLeft > leftOffset)
                    parent.scrollLeft = leftOffset;
                else if (parent.clientWidth + parent.scrollLeft < rightOffset)
                    parent.scrollLeft = rightOffset - parent.clientWidth;
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._focused.off('set');
    }

    render() {
        return (
            <div className={classnames(less.title, {
                [less.titleFocus]: this._focused.value,
                [less.titleFixed]: this.props.args.fixed.value
            })}
                title={this._prompt}
                onClick={this.focus_window}
                onDoubleClick={this.fix_window}
                onContextMenu={this.context_menu}
                ref={(e: any) => this._ref = e}>
                {this._loading.value ?
                    <i className={less.titleLoading} /> :
                    <img className={less.titleIcon} src={this._icon} />
                }
                <span className={less.titleText}>{this._title}</span>
                <div className={less.titleCloseButton} onClick={this.close_window}>×</div>
            </div>
        );
    }
}