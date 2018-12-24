import * as React from 'react';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as attach from 'xterm/lib/addons/attach/attach';
import { Terminal } from 'xterm';
import { ObservableVariable, watch, oArr, oVar } from 'observable-variable';
import debounce = require('lodash.debounce');

import { ServerApi } from '../../../../../../global/ServerApi';
import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { normalSettings } from '../../../../../../global/SystemSetting';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { displayType } from '../../LogWindow';

require('xterm/dist/xterm.css');
Terminal.applyAddon(fit);
Terminal.applyAddon(attach);

const less = require('../TaskLogWindow/TaskLogWindow.less');
const bellSound = require('!url-loader!./terminal-bell-sound.wav');

/**
 * 终端窗口列表
 */
export const terminalWindowList = oArr<string>([]);

/**
 * 处于焦点中的终端窗口
 */
export const focusedTerminalWindow = oVar('');

export class TerminalWindowContent extends ObservableComponent {

    componentDidMount() {
        this.watch([displayType, terminalWindowList]);
    }

    render() {
        return (
            <div className={less.TaskLogWindowContent} style={{ display: displayType.value === 'terminal' ? 'block' : 'none' }}>
                {terminalWindowList.map(item => <TerminalWindow key={item} name={item} />)}
            </div>
        );
    }
}

class TerminalWindow extends ObservableComponent<{ name: string }> {

    private readonly _fontSize = normalSettings.get('client.terminal.fontSize') as ObservableVariable<number>;
    private readonly _bellSound = normalSettings.get('client.terminal.bellSound') as ObservableVariable<boolean>;
    private readonly _terminalID = Math.random().toString().split('.')[1] as string;    //当前终端的随机编号

    private _ref: HTMLDivElement;
    private _terminal: Terminal;
    private _websocket: WebSocket;

    componentDidMount() {
        this.watch([focusedTerminalWindow]);

        this._terminal = new Terminal({
            bellSound,
            bellStyle: this._bellSound.value ? 'sound' : 'none',
            fontSize: this._fontSize.value,
            theme: { background: '#272822' }
        });

        this._terminal.open(this._ref);

        this._unobserve.push(watch([this._fontSize], () => this._terminal.setOption('fontSize', this._fontSize.value)));
        this._unobserve.push(watch([this._bellSound], () => this._terminal.setOption('bellStyle', this._bellSound.value ? 'sound' : 'none')));

        this._websocket = new WebSocket(`wss://${window.location.host}/terminal/open?id=${this._terminalID}`);
        attach.attach(this._terminal, this._websocket, true, false);

        this._terminal.on('resize', debounce(data => {
            ServerApi.terminal.resize(this._terminalID, data.cols, data.rows)
                .catch(err => showMessageBox({ icon: 'error', title: '改变终端视图窗口大小失败', content: err.message }));
        }, 500));

        fit.fit(this._terminal);
        const observer: MutationObserver = new (window as any).ResizeObserver(debounce(() => fit.fit(this._terminal), 500));
        observer.observe(this._ref);
        this._unobserve.push(() => observer.disconnect());
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._terminal.dispose();
        this._websocket.close();
    }

    render() {
        return (
            <div className={less.TaskLogDisplay} ref={(e: any) => this._ref = e}
                style={{ display: focusedTerminalWindow.value === this.props.name ? 'block' : 'none' }} />
        );
    }
}