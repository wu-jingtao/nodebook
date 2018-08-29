import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';
import { MessageBoxOptions } from './MessageBoxOptions';
import { Button } from '../../global/Component/Button/Button';

const less = require('./MessageItem.less');

/**
 * 每一个消息框
 */
export class MessageItem extends ObservableComponent<{ arg: MessageBoxOptions, onClose: () => void }> {

    private readonly _button_ok?: () => void;
    private readonly _button_cancel?: () => void;
    private readonly _progress_update?: (v: number) => void;
    private _timer: any;

    constructor(props: any, context: any) {
        super(props, context);
        const { buttons, progress, autoClose = 7 } = this.props.arg;

        if (buttons) {
            if (buttons.ok)
                this._button_ok = () => { this.props.onClose(); (buttons as any).ok(); }
            if (buttons.cancel)
                this._button_cancel = () => { this.props.onClose(); (buttons as any).cancel(); }
        }

        if (progress) {
            this._progress_update = (value: number) => {
                this.forceUpdate();
                if (value >= 100) {
                    progress.off('set', this._progress_update);
                    if (autoClose > 0) this._timer = setTimeout(this.props.onClose, autoClose * 1000);
                }
            }

            progress.on('set', this._progress_update);
        }

        if (autoClose > 0 && buttons == null && progress == null)
            this._timer = setTimeout(this.props.onClose, autoClose * 1000);
    }

    componentWillUnmount() {
        clearTimeout(this._timer);
        if (this.props.arg.progress) this.props.arg.progress.off('set', this._progress_update);
    }

    render() {
        const { icon, title, content, progress, buttons } = this.props.arg;

        return (
            <div className={less.MessageItem}>
                <span className={less.close} onClick={this.props.onClose}>×</span>
                {icon && <img className={less.icon} src={`./res/img/messageIcon/${icon}.png`} />}
                <div className={classnames(less.right, { hasIcon: icon })}>
                    <div className={less.title}>{title}</div>
                    {progress &&
                        <div className={less.progress}>
                            <div className="bar"><span style={{ width: `${Math.trunc(progress.value)}%` }} /></div>
                            <span className="value">{Math.trunc(progress.value)} %</span>
                        </div>
                    }
                    {content && <div className={less.content}>{content}</div>}
                    {buttons &&
                        <div className={less.buttons}>
                            {buttons.cancel && <Button onClick={this._button_cancel}>取消</Button>}
                            {buttons.ok && <Button onClick={this._button_ok}>确定</Button>}
                        </div>
                    }
                </div>
            </div >
        );
    }
}