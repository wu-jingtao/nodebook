import * as React from 'react';
import * as ReactDom from 'react-dom';
import { oMap } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';

import { MessageBoxOptions } from './MessageBoxOptions';
import { MessageItem } from './MessageItem';

const less = require('./MessageBox.less');

/**
 * 登陆页面
 */
export class MessageBox extends ObservableComponent {

    private _messageBox: JQuery | null;

    componentDidMount() {
        _messageList.on('add', (item, key) => {
            if (this._messageBox) {
                const node = $(`<div class="${less.messageItem}" data-tag="${key}"></div>`);
                this._messageBox.append(node);
                ReactDom.render(<MessageItem arg={item} onClose={() => _messageList.delete(key)} />, node[0]);
                node.addClass('moveIn');
            }
        });

        _messageList.on('remove', (item, key) => {
            if (this._messageBox) {
                const node = this._messageBox.children(`[data-tag="${key}"]`);
                node.on('transitionend', () => {
                    ReactDom.unmountComponentAtNode(node[0]);
                    node.remove();
                });
                node.removeClass('moveIn').addClass('moveOut');
            }
        });
    }

    componentWillUnmount() {
        _messageList.clear();
    }

    render() {
        return <div id="MessageBox" ref={e => this._messageBox = e && $(e)} />;
    }
}

/**
 * 消息列表。key：随机ID
 */
const _messageList = oMap<string, MessageBoxOptions>([]);

/**
 * 添加显示一个新的消息框。返回消息窗ID
 */
export function showMessageBox(arg: MessageBoxOptions): string {
    const id = Math.random().toString();
    _messageList.set(id, arg);
    return id;
}

/**
 * 根据ID，关闭某个特定的消息窗
 */
export function closeMessageBox(id: string): void {
    _messageList.delete(id);
}