import * as React from 'react';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as moment from 'moment';
import { ObservableVariable, watch, oMap } from 'observable-variable';
import debounce = require('lodash.debounce');

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { normalSettings } from '../../../../../../global/SystemSetting';
import { ServerApi } from '../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { displayType } from '../../LogWindow';
import { taskLogWindowList, focusedTaskLogWindow } from './TaskLogWindowList';

require('xterm/dist/xterm.css');
Terminal.applyAddon(fit);

const less = require('./TaskLogWindow.less');

/**
 * 供TaskLogWindow内部使用的消息通信器，key:任务文件路径
 */
export const _communicator = oMap<string, any>([]);

export class TaskLogWindowContent extends ObservableComponent {

    componentDidMount() {
        this.watch([displayType, taskLogWindowList]);
    }

    render() {
        return (
            <div className={less.TaskLogWindowContent} style={{ display: displayType.value === 'log' ? 'block' : 'none' }}>
                {taskLogWindowList.map(item => <TaskLogDisplay key={item} taskFilePath={item} />)}
            </div>
        );
    }
}

class TaskLogDisplay extends ObservableComponent<{ taskFilePath: string }> {

    private readonly _logRefreshInterval = normalSettings.get('client.task.logRefreshInterval') as ObservableVariable<number>;
    private readonly _fontSize = normalSettings.get('client.taskLog.fontSize') as ObservableVariable<number>;
    private readonly _displayTime = normalSettings.get('client.taskLog.displayTime') as ObservableVariable<boolean>;

    private _ref: HTMLDivElement;
    private _terminal: Terminal;

    componentDidMount() {
        this.watch([focusedTaskLogWindow]);

        //#region 设置communicator

        _communicator.set(this.props.taskFilePath, {
            /**
             * 清空任务日志
             */
            cleanTaskLog: async () => {
                try {
                    this._terminal.clear();
                    await ServerApi.task.cleanTaskLogger(this.props.taskFilePath);
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '清空任务日志失败', content: `任务：${this.props.taskFilePath} \n${error.message}` });
                }
            }
        });

        //#endregion

        //#region 初始化Terminal

        this._terminal = new Terminal({
            disableStdin: true,
            convertEol: true,
            fontSize: this._fontSize.value,
            theme: { background: '#272822' }
        });

        this._terminal.open(this._ref);

        this._unobserve.push(watch([this._fontSize], () => this._terminal.setOption('fontSize', this._fontSize.value)));

        fit.fit(this._terminal);
        const observer: MutationObserver = new (window as any).ResizeObserver(debounce(() => fit.fit(this._terminal), 500));
        observer.observe(this._ref);
        this._unobserve.push(() => observer.disconnect());

        //#endregion

        //#region 配置刷新日志计时器

        let timer: any;                 //刷新任务日志计时器
        let lastLogTime: number;        //上一次刷新的最后一条日志的日期

        const setTimer = () => {
            clearInterval(timer);

            timer = setInterval(async () => {
                try {
                    const logs = await ServerApi.task.getLogsAfterDate(this.props.taskFilePath, lastLogTime);
                    if (logs.length > 0) {
                        logs.forEach(item => {
                            if (this._displayTime.value)
                                this._terminal.writeln(`[${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}]  ${item.text}`);
                            else
                                this._terminal.writeln(item.text);
                        });

                        lastLogTime = logs[logs.length - 1].date;
                    }
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '获取任务日志失败', content: `任务：${this.props.taskFilePath} \n${error.message}` });
                }
            }, this._logRefreshInterval.value);
        };

        this._unobserve.push(watch([this._logRefreshInterval], setTimer));
        this._unobserve.push(() => clearInterval(timer));

        setTimer();

        //#endregion
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._terminal.dispose();
    }

    render() {
        return (
            <div className={less.TaskLogDisplay} ref={(e: any) => this._ref = e}
                style={{ display: focusedTaskLogWindow.value === this.props.taskFilePath ? 'block' : 'none' }} />
        );
    }
}