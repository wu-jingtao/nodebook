import * as React from 'react';
import * as classnames from 'classnames';
import { oVar } from 'observable-variable';

import { ObservableComponent, ObservableComponentWrapper } from '../../../../global/Tools/ObservableComponent';
import { showContextMenu } from '../../../ContextMenu/ContextMenu';
import { windowList, moveToOtherSide, closeWindow } from './ContentWindow';
import { FileWindow } from './Windows/FileWindow/FileWindow';
import { TaskWindow } from './Windows/TaskWindow/TaskWindow';
import { ServiceWindow } from './Windows/ServiceWindow/ServiceWindow';
import { SettingsWindow } from './Windows/SettingsWindow/SettingsWindow';

const less = require('./WindowContainer.less');

export class WindowContainer extends ObservableComponent<{ position: 'left' | 'right' }> {

    private readonly _thisSide = this.props.position === 'left' ? windowList.leftWindows : windowList.rightWindows;

    componentDidMount() {
        this.watch(this._thisSide);
    }

    render() {
        const contents = [], tabs = [], functionButtons = [];

        for (const item of this._thisSide.value) {
            const title = oVar<any>(false), buttons = oVar<any>(false);

            //标题栏
            tabs.push(<ObservableComponentWrapper key={`${item.type}-${item.name}`} watch={[title, item.fixed, windowList.focusedWindow]}
                render={() => {
                    //是否处于焦点
                    const focused = windowList.focusedWindow.value &&
                        windowList.focusedWindow.value.side === this.props.position &&
                        windowList.focusedWindow.value.type === item.type &&
                        windowList.focusedWindow.value.name === item.name;

                    //关闭窗口
                    const close_window = (e?: React.MouseEvent) => {
                        if (e) {
                            if (e.button === 0) {   //确保是左键点击
                                e.stopPropagation();
                                closeWindow({ name: item.name, type: item.type, side: this.props.position });
                            }
                        } else
                            closeWindow({ name: item.name, type: item.type, side: this.props.position });
                    };

                    //使窗口获得焦点
                    const focus_window = (e: React.MouseEvent) => {
                        if (e.button === 0 && !focused)
                            windowList.focusedWindow.value = { name: item.name, type: item.type, side: this.props.position };
                    };

                    //右键菜单
                    const context_menu = (e: React.MouseEvent) => {
                        if (e.button === 2) {
                            e.preventDefault();
                            showContextMenu({
                                position: { x: e.clientX, y: e.clientY },
                                items: [
                                    [
                                        { name: '关闭窗口', callback: close_window },
                                        { name: '固定窗口', callback: () => item.fixed.value = true },
                                        {
                                            name: `移动到${this.props.position === 'left' ? '右' : '左'}侧显示`,
                                            callback: () => moveToOtherSide({ name: item.name, type: item.type, side: this.props.position })
                                        }
                                    ]
                                ]
                            });
                        }
                    };

                    return (
                        <div className={classnames(less.tabItem, {
                            [less.tabItemFocus]: focused,
                            [less.tabItemFixed]: item.fixed.value
                        })}
                            title={item.name}
                            onClick={focus_window}
                            onContextMenu={context_menu}>
                            <div className={less.tabItemContent}>{title.value}</div>
                            <div className={less.tabItemCloseButton} onClick={close_window}>×</div>
                        </div>
                    );
                }} />);

            //功能按钮
            functionButtons.push(<ObservableComponentWrapper key={`${item.type}-${item.name}`} watch={[buttons, windowList.focusedWindow]}
                render={() => (
                    <div style={{
                        display: windowList.focusedWindow.value &&
                            windowList.focusedWindow.value.side === this.props.position &&
                            windowList.focusedWindow.value.type === item.type &&
                            windowList.focusedWindow.value.name === item.name ? 'block' : 'none'
                    }}>
                        {buttons.value}
                        <img className={less.functionButtonItem}
                            src={`/static/res/img/buttons_icon/${this.props.position === 'left' ? 'next' : 'previous'}-inverse.svg`}
                            title={`移动到${this.props.position === 'left' ? '右' : '左'}侧显示`}
                            onClick={() => moveToOtherSide({ name: item.name, type: item.type, side: this.props.position })} />
                    </div>
                )} />);

            switch (item.type) {
                case 'file':
                    contents.push(<FileWindow key={`${item.type}-${item.name}`} name={item.name}
                        title={title} functionButtons={buttons} args={item.args} />);
                    break;

                case 'task':
                    contents.push(<TaskWindow key={`${item.type}-${item.name}`} name={item.name}
                        title={title} functionButtons={buttons} args={item.args} />);
                    break;

                case 'service':
                    contents.push(<ServiceWindow key={`${item.type}-${item.name}`} name={item.name}
                        title={title} functionButtons={buttons} args={item.args} />);
                    break;

                case 'setting':
                    contents.push(<SettingsWindow key={`${item.type}-${item.name}`} name={item.name}
                        title={title} functionButtons={buttons} args={item.args} />);
                    break;
            }
        }

        return (
            <div className={less.WindowContainer}>
                <div className={less.titleBar}>
                    <div className={less.tabs}>
                        {tabs}
                    </div>
                    <div className={less.functionButtons}>
                        {functionButtons}
                    </div>
                </div>
                <div className={less.content}>
                    {contents}
                </div>
            </div>
        );
    }
}