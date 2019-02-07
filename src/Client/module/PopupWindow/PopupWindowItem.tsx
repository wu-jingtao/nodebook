import * as React from 'react';

import { ObservableComponent } from "../../global/Tools/ObservableComponent";
import { Button } from '../../global/Component/Button/Button';
import { PopupWindowConfig } from "./PopupWindowConfig";
import { closePopupWindow } from './PopupWindow';

const less = require('./PopupWindow.less');

export class PopupWindowItem extends ObservableComponent<{ windowId: string, config: PopupWindowConfig }> {

    private readonly _buttonCancelClick = () => {
        closePopupWindow(this.props.windowId);
        this.props.config.cancel && this.props.config.cancel.callback();
    };

    private readonly _buttonOkClick = () => {
        closePopupWindow(this.props.windowId);
        this.props.config.ok && this.props.config.ok.callback();
    };

    private readonly _onKeyDown = (e: JQuery.KeyDownEvent) => {
        e.stopImmediatePropagation();   //防止在其他弹窗层中触发
        e.stopPropagation();

        if (e.keyCode === 13) //回车键
            this._buttonOkClick();
        else if (e.keyCode === 27) //Esc键
            this._buttonCancelClick();
    };

    componentDidMount() {
        $(document).on('keydown', this._onKeyDown);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $(document).off('keydown', this._onKeyDown);
    }

    render() {
        return (
            <div className={less.PopupWindowItem}>
                <div className={less.title}>{this.props.config.title}</div>
                <div className={less.content}>{this.props.config.content}</div>
                <div className={less.bottom}>
                    <Button className={less.button} onClick={this._buttonCancelClick}>
                        {this.props.config.cancel && this.props.config.cancel.name || '取消'}
                    </Button>
                    {this.props.config.ok &&
                        <Button className={less.button} onClick={this._buttonOkClick}>
                            {this.props.config.ok.name || '确认'}
                        </Button>
                    }
                </div>
            </div >
        );
    }
}