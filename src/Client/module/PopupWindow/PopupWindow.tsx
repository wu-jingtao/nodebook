import * as React from 'react';
import { oMap } from 'observable-variable';

import { ObservableComponent } from "../../global/Tools/ObservableComponent";
import { Button } from '../../global/Component/Button/Button';
import { PopupWindowConfig } from './PopupWindowConfig';

const less = require('./PopupWindow.less');

const _windowContent = oMap<string, PopupWindowConfig>([]);

/**
 * 显示弹窗。返回窗口对应的随机id
 */
export function showPopupWindow(config: PopupWindowConfig): string {
    const id = Math.random().toString();
    _windowContent.set(id, config);
    return id;
}

/**
 * 关闭特定弹窗
 */
export function closePopupWindow(id: string): void {
    _windowContent.delete(id);
}

/**
 * 弹窗
 */
export class PopupWindow extends ObservableComponent {

    componentDidMount() {
        this.watch(_windowContent);
    }

    render() {
        return (
            <div id="PopupWindow">
                {[..._windowContent.entries()].slice(-1).map(([id, config]) =>
                    <PopupWindowItem key={id} id={id} config={config} />)}
            </div>
        );
    }
}

class PopupWindowItem extends ObservableComponent<{ id: string, config: PopupWindowConfig }>{

    private _ref: JQuery<HTMLDivElement>;

    private readonly _ok = () => {
        closePopupWindow(this.props.id);
        this.props.config.ok && this.props.config.ok();
    };

    private readonly _cancel = () => {
        closePopupWindow(this.props.id);
        this.props.config.cancel && this.props.config.cancel();
    };

    componentDidMount() {
        this._ref.addClass(less.openAnimation);
    }

    componentWillUnmount() {
        this._ref.addClass(less.closeAnimation);
    }

    render() {
        return (
            <div className={less.PopupWindowItem} ref={(e: any) => this._ref = e && $(e)}>
                <div className={less.content}>{this.props.config.content}</div>
                <div className={less.bottom}>
                    {this.props.config.ok && <Button className={less.button} onClick={this._ok}>确认</Button>}
                    <Button className={less.button} onClick={this._cancel}>关闭</Button>
                </div>
            </div>
        );
    }
}