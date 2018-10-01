import * as React from 'react';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { windowList } from './ContentWindow';
import { FileWindowContent } from './Windows/FileWindow/FileWindowContent';
import { FileWindowTitle } from './Windows/FileWindow/FileWindowTitle';
import { FileWindowFunctionButtons } from './Windows/FileWindow/FileWindowFunctionButtons';
import { TaskWindowContent } from './Windows/TaskWindow/TaskWindowContent';
import { TaskWindowTitle } from './Windows/TaskWindow/TaskWindowTitle';
import { TaskWindowFunctionButtons } from './Windows/TaskWindow/TaskWindowFunctionButtons';
import { ServiceWindowContent } from './Windows/ServiceWindow/ServiceWindowContent';
import { ServiceWindowTitle } from './Windows/ServiceWindow/ServiceWindowTitle';
import { ServiceWindowFunctionButtons } from './Windows/ServiceWindow/ServiceWindowFunctionButtons';
import { SettingsWindowContent } from './Windows/SettingsWindow/SettingsWindowContent';
import { SettingsWindowTitle } from './Windows/SettingsWindow/SettingsWindowTitle';
import { SettingsWindowFunctionButtons } from './Windows/SettingsWindow/SettingsWindowFunctionButtons';

const less = require('./WindowContainer.less');

export class WindowContainer extends ObservableComponent<{ position: 'left' | 'right' }> {

    private readonly _thisSide = this.props.position === 'left' ? windowList.leftWindows : windowList.rightWindows;

    componentDidMount() {
        this.watch(this._thisSide);
    }

    render() {
        const contents = [], titles = [], functionButtons = [];

        for (const item of this._thisSide.value) {
            const key = `${item.type}-${item.name}`;

            switch (item.type) {
                case 'file':
                    contents.push(<FileWindowContent key={key} window={item} position={this.props.position} />);
                    titles.push(<FileWindowTitle key={key} window={item} position={this.props.position} />);
                    functionButtons.push(<FileWindowFunctionButtons key={key} window={item} position={this.props.position} />);
                    break;

                case 'task':
                    contents.push(<TaskWindowContent key={key} window={item} position={this.props.position} />);
                    titles.push(<TaskWindowTitle key={key} window={item} position={this.props.position} />);
                    functionButtons.push(<TaskWindowFunctionButtons key={key} window={item} position={this.props.position} />);
                    break;

                case 'service':
                    contents.push(<ServiceWindowContent key={key} window={item} position={this.props.position} />);
                    titles.push(<ServiceWindowTitle key={key} window={item} position={this.props.position} />);
                    functionButtons.push(<ServiceWindowFunctionButtons key={key} window={item} position={this.props.position} />);
                    break;

                case 'setting':
                    contents.push(<SettingsWindowContent key={key} window={item} position={this.props.position} />);
                    titles.push(<SettingsWindowTitle key={key} window={item} position={this.props.position} />);
                    functionButtons.push(<SettingsWindowFunctionButtons key={key} window={item} position={this.props.position} />);
                    break;
            }
        }

        return (
            <div className={less.WindowContainer}>
                <div className={less.titleBar}>
                    <div className={less.tabs}>
                        {titles}
                    </div>
                    {functionButtons}
                </div>
                {contents}
            </div>
        );
    }
}