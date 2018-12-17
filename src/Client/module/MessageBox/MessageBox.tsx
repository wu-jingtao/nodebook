import * as React from 'react';
import * as ReactDom from 'react-dom';
import { oMap } from 'observable-variable';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { MessageBoxOptions } from './MessageBoxOptions';
import { MessageItem } from './MessageItem';

const less = require('./MessageBox.less');

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

/**
 * 消息弹窗
 */
export class MessageBox extends ObservableComponent {

    private _messageBox: JQuery<HTMLDivElement>;

    componentDidMount() {
        _messageList.on('add', (config, id) => {
            const node = $(`<div class="${less.messageItemAnimation}" data-tag="${id}"></div>`);
            this._messageBox.prepend(node);
            ReactDom.render(<MessageItem config={config} messageId={id} />, node[0]);
            setTimeout(() => node.addClass('moveIn'), 5);
        });

        _messageList.on('remove', (config, id) => {
            const node = this._messageBox.children(`[data-tag="${id}"]`);
            node.addClass('moveOut');
            setTimeout(() => {  //退出动画有400ms
                ReactDom.unmountComponentAtNode(node[0]);
                node.remove();
            }, 500);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        _messageList.clear();
        _messageList.off('add');
        _messageList.off('remove');
    }

    render() {
        return <div id="MessageBox" ref={(e: any) => this._messageBox = e && $(e)} />;
    }
}