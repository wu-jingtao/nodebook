import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { normalSettings } from '../../../../global/SystemSetting';
import { SideBarPropsType } from './SideBarPropsType';
import { topWindowIndex } from '../ContentWindow/ContentWindowPropsType';

const less = require('./SideBar.less');

/**
 * 侧边栏，功能区按钮
 */
export class SideBar extends ObservableComponent<SideBarPropsType> {

    /**
     * 是否在顶部显示程序图标
     */
    private readonly _showLogo = normalSettings.get('client.sidebar.showLogo') as ObservableVariable<boolean>;

    /**
     * 打开设置窗口
     */
    private readonly _openSettingWindow = () => {
        const setting_window = this.props.openedWindows.find(item => item._tag === 'setting_window');
        if (setting_window) {
            setting_window.z_index.value = topWindowIndex(this.props.openedWindows);
        } else {
            //todo 
        }
    };

    /**
     * 改变要显示的功能区
     */
    private readonly _changeFunctionArea = (changeTo: 'file' | 'task' | 'shortcut' | 'service') => {
        this.props.functionAreaDisplayType.value = this.props.functionAreaDisplayType.value === changeTo ? undefined : changeTo;
    }

    constructor(props: any, context: any) {
        super(props, context);

        this.watch(this._showLogo, this.props.functionAreaDisplayType, this.props.showLogWindow,
            this.props.fileManagerNumber, this.props.serviceManagerErrorNumber);
    }

    render() {
        return (
            <div id="SideBar">
                <div className={less.top}>
                    {this._showLogo.value && <img src="/logo/icon.png" className={less.logo} />}
                    <div className={classnames(less.icon, { selected: this.props.functionAreaDisplayType.value === 'shortcut' })}
                        onClick={() => this._changeFunctionArea('shortcut')} title="快捷方式" >
                        <i className="iconfont icon-paper-plane" />
                    </div>
                    <div className={classnames(less.icon, { selected: this.props.functionAreaDisplayType.value === 'file' })}
                        onClick={() => this._changeFunctionArea('file')} title="资源管理器" >
                        <i className="iconfont icon-file" />
                        {this.props.fileManagerNumber.value > 0 &&
                            <span className={classnames(less.iconNumber, 'blue')}>{this.props.fileManagerNumber.value}</span>}
                    </div>
                    <div className={classnames(less.icon, { selected: this.props.functionAreaDisplayType.value === 'task' })}
                        onClick={() => this._changeFunctionArea('task')} title="任务管理器" >
                        <i className="iconfont icon-tasks" />
                    </div>
                    <div className={classnames(less.icon, { selected: this.props.functionAreaDisplayType.value === 'service' })}
                        onClick={() => this._changeFunctionArea('service')} title="服务列表" >
                        <i className="iconfont icon-ic_networkservices" />
                        {this.props.serviceManagerErrorNumber.value > 0 &&
                            <span className={classnames(less.iconNumber, 'red')}>{this.props.serviceManagerErrorNumber.value}</span>}
                    </div>
                </div>
                <div className={less.bottom}>
                    <div className={less.icon}
                        onClick={this._openSettingWindow} title="系统设置" >
                        <i className="iconfont icon-setting" />
                    </div>
                    <div className={classnames(less.icon, { selected: this.props.showLogWindow.value })}
                        onClick={() => this.props.showLogWindow.value = !this.props.showLogWindow.value} title="日志窗口" >
                        <i className="iconfont icon-bxs-terminal" />
                    </div>
                </div>
            </div>
        );
    }
}