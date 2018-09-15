import * as React from 'react';
import * as ReactDom from 'react-dom';
import { oMap } from 'observable-variable';

import { ObservableComponent } from "../../global/Tools/ObservableComponent";
import { PopupWindowConfig } from './PopupWindowConfig';
import { PopupWindowItem } from './PopupWindowItem';

const less = require('./PopupWindow.less');

const _windowList = oMap<string, PopupWindowConfig>([]);

/**
 * 显示弹窗。返回窗口对应的随机id
 */
export function showPopupWindow(config: PopupWindowConfig): string {
    const id = Math.random().toString();
    _windowList.set(id, config);
    return id;
}

/**
 * 关闭特定弹窗
 */
export function closePopupWindow(id: string): void {
    _windowList.delete(id);
}

/**
 * 弹窗
 */
export class PopupWindow extends ObservableComponent {

    private _popupWindow: JQuery<HTMLDivElement>;

    componentDidMount() {
        _windowList.on('add', (config, id) => {
            const node = $(`<div class="${less.popupWindowItemWrapper}" data-tag="${id}"></div>`);
            this._popupWindow.append(node);

            ReactDom.render(<PopupWindowItem config={config} windowId={id} />, node[0]);
            setTimeout(() => node.addClass('moveIn'), 5);

            node.on('click', e => {
                if (e.target === node[0]) {
                    closePopupWindow(id);
                    config.cancel && config.cancel.callback();
                }
            });
        });

        _windowList.on('remove', (config, id) => {
            const node = this._popupWindow.children(`[data-tag="${id}"]`);
            node.one('transitionend', () => {
                ReactDom.unmountComponentAtNode(node[0]);
                node.remove();
            });
            node.addClass('moveOut');
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        _windowList.clear();
        _windowList.off('add');
        _windowList.off('remove');
    }

    render() {
        return <div id="PopupWindow" ref={(e: any) => this._popupWindow = e && $(e)} />;
    }
}
