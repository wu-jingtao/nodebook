import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, oVar } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { normalSettings } from '../../../../global/SystemSetting';
import { displayType } from '../FunctionArea/FunctionArea';
import { cachedFiles } from '../../../../global/UnsavedFiles';
import { crashedServiceNumber } from '../FunctionArea/FunctionPanel/ServiceManager/ServiceManager';
import { showLogWindow } from '../LogWindow/LogWindow';
import { openWindow } from '../ContentWindow/WindowList';
import { WindowType, SettingsWindowArgs } from '../ContentWindow/ContentWindowTypes';

const less = require('./SideBar.less');

/**
 * 侧边栏，功能区按钮
 */
export class SideBar extends ObservableComponent {

    /**
     * 是否在顶部显示程序图标
     */
    private readonly _showLogo = normalSettings.get('client.sidebar.showLogo') as ObservableVariable<boolean>;

    /**
     * 为程序图标添加一些内边距
     */
    private readonly _logoPadding = normalSettings.get('client.sidebar.logoPadding') as ObservableVariable<boolean>;

    /**
     * 打开设置窗口
     */
    private readonly _openSettingWindow = () => {
        const args: SettingsWindowArgs = { id: Math.random().toString(), name: '系统设置', type: WindowType.settings, fixed: oVar(true) };
        openWindow(args);
    };

    /**
     * 改变要显示的功能区
     */
    private readonly _changeFunctionArea = (changeTo: 'file' | 'task' | 'shortcut' | 'service') => {
        displayType.value = displayType.value === changeTo ? null : changeTo;
    }

    componentDidMount() {
        this.watch([this._showLogo, this._logoPadding, displayType, showLogWindow, cachedFiles, crashedServiceNumber]);
    }

    render() {
        return (
            <div id="SideBar">
                <div className={less.top}>
                    {this._showLogo.value &&
                        <img src="/logo/icon.png" className={classnames(less.logo, { [less.logoPadding]: this._logoPadding.value })} />}
                    <div className={classnames(less.icon, { selected: displayType.value === 'shortcut' })}
                        onClick={() => this._changeFunctionArea('shortcut')} title="快捷方式" >
                        <i className="iconfont icon-xingzhuang" />
                    </div>
                    <div className={classnames(less.icon, { selected: displayType.value === 'file' })}
                        onClick={() => this._changeFunctionArea('file')} title="资源管理器" >
                        <i className="iconfont icon-folder" />
                        {cachedFiles.size > 0 &&
                            <span className={classnames(less.iconNumber, 'blue')}>{Math.min(cachedFiles.size, 99)}</span>}
                    </div>
                    <div className={classnames(less.icon, { selected: displayType.value === 'task' })}
                        onClick={() => this._changeFunctionArea('task')} title="任务管理器" >
                        <i className="iconfont icon-page1" />
                    </div>
                    <div className={classnames(less.icon, { selected: displayType.value === 'service' })}
                        onClick={() => this._changeFunctionArea('service')} title="服务管理器" >
                        <i className="iconfont icon-ic_networkservices" />
                        {crashedServiceNumber.value > 0 &&
                            <span className={classnames(less.iconNumber, 'red')}>{Math.min(crashedServiceNumber.value, 99)}</span>}
                    </div>
                </div>
                <div className={less.bottom}>
                    <div className={less.icon}
                        onClick={this._openSettingWindow} title="系统设置" >
                        <i className="iconfont icon-setting1" />
                    </div>
                    <div className={classnames(less.icon, { selected: showLogWindow.value })}
                        onClick={() => showLogWindow.value = !showLogWindow.value} title="终端与日志" >
                        <i className="iconfont icon-bxs-terminal" />
                    </div>
                </div>
            </div>
        );
    }
}