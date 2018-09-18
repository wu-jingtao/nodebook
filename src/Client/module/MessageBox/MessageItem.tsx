import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent, ObservableComponentWrapper } from '../../global/Tools/ObservableComponent';
import { Button } from '../../global/Component/Button/Button';
import { MessageBoxOptions } from './MessageBoxOptions';
import { closeMessageBox } from './MessageBox';

const less = require('./MessageItem.less');

/**
 * 每一个消息框
 */
export class MessageItem extends ObservableComponent<{ config: MessageBoxOptions, messageId: string }> {

    private readonly _progress: JSX.Element;
    private readonly _button: JSX.Element;
    private _icon: JSX.Element;
    private _timer: any;

    constructor(props: any, context: any) {
        super(props, context);

        const { icon, buttons, progress, autoClose = 7 } = this.props.config;

        if (icon)
            this._icon = <img className={less.icon} src={`./res/img/message_icon/${icon}.png`} />;

        if (buttons) {
            this._button = (
                <div className={less.buttons}>
                    {buttons.cancel &&
                        <Button onClick={() => { closeMessageBox(this.props.messageId); (buttons.cancel as any).callback(); }}>
                            {buttons.cancel.name || '取消'}
                        </Button>
                    }
                    {buttons.ok &&
                        <Button onClick={() => { closeMessageBox(this.props.messageId); (buttons.ok as any).callback(); }}>
                            {buttons.ok.name || '确定'}
                        </Button>
                    }
                </div>
            );
        }

        if (progress) {
            let reached100 = false; //进度是否到达了100

            this._progress = <ObservableComponentWrapper watch={[progress]} render={() => {
                const value = Math.min(Math.max(progress.value, 0), 100);

                if (!reached100 && value === 100) {
                    reached100 = true;
                    if (autoClose > 0) {
                        this._timer = setTimeout(() => closeMessageBox(this.props.messageId), autoClose * 1000);
                        this._icon = <img className={less.icon} src={`./res/img/message_icon/ok.png`} />;
                        this.forceUpdate();
                    }
                }

                return (
                    <div className={less.progress}>
                        <div className="bar"><span style={{ width: `${Math.trunc(value)}%` }} /></div>
                        <span className="value">{Math.trunc(value)} %</span>
                    </div>
                );
            }} />
        }

        if (autoClose > 0 && buttons == null && progress == null)
            this._timer = setTimeout(() => closeMessageBox(this.props.messageId), autoClose * 1000);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        clearTimeout(this._timer);
    }

    render() {
        const { icon, title, content } = this.props.config;

        return (
            <div className={less.MessageItem}>
                <span className={less.close} onClick={() => closeMessageBox(this.props.messageId)}>×</span>
                {this._icon}
                <div className={classnames(less.right, { hasIcon: icon })}>
                    <div className={less.title}>{title}</div>
                    {this._progress}
                    {content && <div className={less.content}>{content}</div>}
                    {this._button}
                </div>
            </div >
        );
    }
}