import * as React from 'react';

import { ObservableComponent } from '../../global/Tools/ObservableComponent';

import { MessageBoxOptions } from './MessageBoxOptions';

const less = require('./MessageItem.less');

/**
 * 每一条消息
 */
export class MessageItem extends ObservableComponent<{ arg: MessageBoxOptions, onClose: () => void }> {

    private _timer: NodeJS.Timer;

    private _progressUpdate = (value: number) => {
        this.forceUpdate();
        if (this.props.arg.autoClose !== false && value >= 100)
            this.props.onClose();
    };

    componentWillMount() {
        if (this.props.arg.progress)
            this.props.arg.progress.on('set', this._progressUpdate);
        else if (this.props.arg.autoClose !== false && this.props.arg.buttons == null)
            this._timer = setTimeout(() => this.props.onClose(), 10 * 1000);
    }

    componentWillUnmount() {
        clearTimeout(this._timer);
        if (this.props.arg.progress)
            this.props.arg.progress.off('set', this._progressUpdate);
    }

    render() {
        const argument = this.props.arg;

        return (
            <div className={less.MessageItem}>
                <span className={less.close}>x</span>
                {argument.icon && <img className={less.icon} src={`./res/img/messageLogo/${argument.icon}.png`} />}
                <div className={less.right}>
                    <div className={less.title}>{argument.title}</div>
                    {argument.progress &&
                        <div className={less.progress}>
                            <span style={{ width: `${argument.progress.value}%` }} />
                            <span>{argument.progress.value}%</span>
                        </div>
                    }
                    {argument.content && <div className={less.content}>{argument.content}</div>}
                    {argument.buttons &&
                        <div className={less.buttons}>
                            {argument.buttons.ok && <button onClick={() => { this.props.onClose(); (argument.buttons as any).ok(); }}>确定</button>}
                            {argument.buttons.cancel && <button onClick={() => { this.props.onClose(); (argument.buttons as any).cancel(); }}>取消</button>}
                        </div>
                    }
                </div>
            </div >
        );
    }
}