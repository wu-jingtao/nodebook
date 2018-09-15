import * as React from 'react';

import { ObservableComponent } from "../../global/Tools/ObservableComponent";
import { Button } from '../../global/Component/Button/Button';
import { PopupWindowConfig } from "./PopupWindowConfig";
import { closePopupWindow } from './PopupWindow';

const less = require('./PopupWindow.less');

export class PopupWindowItem extends ObservableComponent<{ windowId: string, config: PopupWindowConfig }>{
    render() {
        return (
            <div className={less.PopupWindowItem}>
                <div className={less.title}>{this.props.config.title}</div>
                <div className={less.content}>{this.props.config.content}</div>
                <div className={less.bottom}>
                    <Button
                        className={less.button}
                        onClick={() => { closePopupWindow(this.props.windowId); this.props.config.cancel && this.props.config.cancel.callback(); }}>
                        {this.props.config.cancel && this.props.config.cancel.name || '取消'}
                    </Button>
                    {this.props.config.ok &&
                        <Button
                            className={less.button}
                            onClick={() => { closePopupWindow(this.props.windowId); (this.props.config.ok as any).callback(); }}>
                            {this.props.config.ok.name || '确认'}
                        </Button>
                    }
                </div>
            </div >
        );
    }
}