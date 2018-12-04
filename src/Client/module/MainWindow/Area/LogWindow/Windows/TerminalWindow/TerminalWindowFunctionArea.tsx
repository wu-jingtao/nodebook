import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { DropDownList } from '../../../../../../global/Component/DropDownList/DropDownList';
import { displayType } from '../../LogWindow';
import { focusedTerminalWindow, terminalWindowList } from './TerminalWindowContent';

const less = require('../TaskLogWindow/TaskLogWindow.less');

export class TerminalWindowFunctionArea extends ObservableComponent {

    //终端的编号
    private static _TerminalIndex = 1;

    //关闭终端
    private readonly _closeTerminal = () => {
        if (focusedTerminalWindow.value) {
            terminalWindowList.delete(focusedTerminalWindow.value);
            focusedTerminalWindow.value = terminalWindowList.last || '';
        }
    };

    //新建终端
    private readonly _createTerminal = () => {
        const name = `终端 ${TerminalWindowFunctionArea._TerminalIndex++}`;
        terminalWindowList.push(name);
        focusedTerminalWindow.value = name;
    };

    componentDidMount() {
        this.watch([displayType, terminalWindowList, focusedTerminalWindow]);
    }

    render() {
        return (
            <div className={less.TaskLogWindowFunctionArea} style={{ display: displayType.value === 'terminal' ? 'flex' : 'none' }}>
                <DropDownList className={less.dropDownList} value={focusedTerminalWindow}
                    options={terminalWindowList.map(item => ({ text: item, value: item }))} />
                {!!focusedTerminalWindow.value &&
                    <img className={less.functionButton} src="/static/res/img/buttons_icon/kill-inverse.svg"
                        title="关闭终端" onClick={this._closeTerminal} />}
                <img className={less.functionButton} src="/static/res/img/buttons_icon/add_inverse.svg"
                    title="新建终端" onClick={this._createTerminal} />
            </div>
        );
    }
}