import * as React from 'react';
import * as classnames from 'classnames';
import { permanent_oVar, oVar, watch } from 'observable-variable';

import { ObservableComponent, ObservableComponentWrapper } from '../../../../global/Tools/ObservableComponent';
import { Splitter } from '../../../../global/Component/Splitter/Splitter';
import { TaskLogWindowFunctionArea } from './Windows/TaskLogWindow/TaskLogWindowFunctionArea';
import { TerminalWindowFunctionArea } from './Windows/TerminalWindow/TerminalWindowFunctionArea';
import { TaskLogWindowContent } from './Windows/TaskLogWindow/TaskLogWindowContent';
import { TerminalWindowContent } from './Windows/TerminalWindow/TerminalWindowContent';

const less = require('./LogWindow.less');

/**
 * 是否显示日志窗口
 */
export const showLogWindow = permanent_oVar('ui.LogWindow._showLogWindow', { defaultValue: false });

/**
 * 显示那种类型的窗口
 */
export const displayType = oVar<'log' | 'terminal'>('log');

/**
 * 日志窗口
 */
export class LogWindow extends ObservableComponent {

    private readonly _height = permanent_oVar('ui.LogWindow._height', { defaultValue: 200 });   //日志窗口的高度
    private readonly _reachedTop = oVar(false); //判断是否显示使日志窗口高度最大化图标
    private _maximizedBeforeHeight = 0; //最大化窗口之前的高度

    //最大化或恢复窗口高度
    private readonly _maximizeOrResumeWindowHeight = () => {
        if (this._reachedTop.value)
            this._height.value = this._maximizedBeforeHeight;
        else {
            this._maximizedBeforeHeight = this._height.value;
            this._height.value = 9999;
            this._reachedTop.value = true;
        }
    };

    componentDidMount() {
        this.watch([this._height, showLogWindow], 0);
        this._unobserve.push(watch([this._height], () => this._reachedTop.value = false));
    }

    render() {
        return (
            <div id="LogWindow" style={{ flexBasis: this._height.value, display: showLogWindow.value ? 'block' : 'none' }}>
                <Splitter className={less.splitter} onChange={position => this._height.value = window.innerHeight - position - 3} vertical />
                <div className={less.header}>
                    <div className={less.windowTitles} style={{ flexBasis: '108px' }}>
                        <ObservableComponentWrapper watch={[displayType]} render={() =>
                            <div className={classnames({ focused: displayType.value === 'log' })} onClick={() => displayType.value = 'log'}>日志</div>} />
                        <ObservableComponentWrapper watch={[displayType]} render={() =>
                            <div className={classnames({ focused: displayType.value === 'terminal' })} onClick={() => displayType.value = 'terminal'}>终端</div>} />
                    </div>
                    <div className={less.functionArea}>
                        <TaskLogWindowFunctionArea />
                        <TerminalWindowFunctionArea />
                    </div>
                    <div className={less.headerButtons}>
                        <ObservableComponentWrapper watch={[this._reachedTop]} render={() => (
                            <img style={{ width: '15px', height: '15px', padding: '10px' }}
                                src={`/static/res/img/buttons_icon/arrow-${this._reachedTop.value ? 'down' : 'up'}-dark.svg`}
                                title={this._reachedTop.value ? '恢复日志窗口大小' : '最大化日志窗口大小'}
                                onClick={this._maximizeOrResumeWindowHeight} />
                        )} />
                        <img src="/static/res/img/buttons_icon/action-close-dark.svg"
                            title="关闭日志窗口" onClick={() => showLogWindow.value = false} />
                    </div>
                </div>
                <div className={less.content}>
                    <TaskLogWindowContent />
                    <TerminalWindowContent />
                </div>
            </div>
        );
    }
}   