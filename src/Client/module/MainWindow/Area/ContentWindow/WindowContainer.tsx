import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent } from '../../../../global/Tools/ObservableComponent';
import { CodeEditorWindowContent } from './Windows/CodeEditorWindow/CodeEditorWindowContent';
import { CodeEditorWindowTitle } from './Windows/CodeEditorWindow/CodeEditorWindowTitle';
import { CodeEditorWindowFunctionButtons } from './Windows/CodeEditorWindow/CodeEditorWindowFunctionButtons';
import { HtmlViewerWindowContent } from './Windows/HtmlViewerWindow/HtmlViewerWindowContent';
import { HtmlViewerWindowTitle } from './Windows/HtmlViewerWindow/HtmlViewerWindowTitle';
import { HtmlViewerWindowFunctionButtons } from './Windows/HtmlViewerWindow/HtmlViewerWindowFunctionButtons';
import { MarkdownViewerWindowContent } from './Windows/MarkdownViewerWindow/MarkdownViewerWindowContent';
import { MarkdownViewerWindowTitle } from './Windows/MarkdownViewerWindow/MarkdownViewerWindowTitle';
import { MarkdownViewerWindowFunctionButtons } from './Windows/MarkdownViewerWindow/MarkdownViewerWindowFunctionButtons';
import { ImageViewerWindowContent } from './Windows/ImageViewerWindow/ImageViewerWindowContent';
import { ImageViewerWindowTitle } from './Windows/ImageViewerWindow/ImageViewerWindowTitle';
import { ImageViewerWindowFunctionButtons } from './Windows/ImageViewerWindow/ImageViewerWindowFunctionButtons';
import { VideoPlayerWindowContent } from './Windows/VideoPlayerWindow/VideoPlayerWindowContent';
import { VideoPlayerWindowTitle } from './Windows/VideoPlayerWindow/VideoPlayerWindowTitle';
import { VideoPlayerWindowFunctionButtons } from './Windows/VideoPlayerWindow/VideoPlayerWindowFunctionButtons';
import { TaskWindowContent } from './Windows/TaskWindow/TaskWindowContent';
import { TaskWindowTitle } from './Windows/TaskWindow/TaskWindowTitle';
import { TaskWindowFunctionButtons } from './Windows/TaskWindow/TaskWindowFunctionButtons';
import { ServiceWindowContent } from './Windows/ServiceWindow/ServiceWindowContent';
import { ServiceWindowTitle } from './Windows/ServiceWindow/ServiceWindowTitle';
import { ServiceWindowFunctionButtons } from './Windows/ServiceWindow/ServiceWindowFunctionButtons';
import { SettingsWindowContent } from './Windows/SettingsWindow/SettingsWindowContent';
import { SettingsWindowTitle } from './Windows/SettingsWindow/SettingsWindowTitle';
import { SettingsWindowFunctionButtons } from './Windows/SettingsWindow/SettingsWindowFunctionButtons';
import { windowList } from './WindowList';
import { WindowType } from './ContentWindowTypes';

const less = require('./WindowContainer.less');

export class WindowContainer extends ObservableComponent<{ side: 'left' | 'right' }> {

    private readonly _thisSide = this.props.side === 'left' ? windowList.leftWindows : windowList.rightWindows;

    private readonly _scrollTitleBar = (e: React.WheelEvent) => {
        e.stopPropagation();
        e.currentTarget.scrollLeft += e.deltaY / 2;
    };

    //使得当前这边窗口获取到焦点
    private readonly _focusThisSide = (e: React.MouseEvent) => {
        if (e.button === 0)
            windowList.focusedSide.value = this.props.side;
    };

    componentDidMount() {
        this.watch([this._thisSide.windowList, windowList.focusedSide]);
    }

    render() {
        const contents = [], titles = [], functionButtons = [];

        for (const item of this._thisSide.windowList.value) {
            const communicator = {};

            switch (item.type) {
                case WindowType.code_editor:
                    contents.push(<CodeEditorWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<CodeEditorWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<CodeEditorWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;

                case WindowType.html_viewer:
                    contents.push(<HtmlViewerWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<HtmlViewerWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<HtmlViewerWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;

                case WindowType.markdown_viewer:
                    contents.push(<MarkdownViewerWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<MarkdownViewerWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<MarkdownViewerWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;

                case WindowType.image_viewer:
                    contents.push(<ImageViewerWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<ImageViewerWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<ImageViewerWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;

                case WindowType.video_player:
                    contents.push(<VideoPlayerWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<VideoPlayerWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<VideoPlayerWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;

                case WindowType.task:
                    contents.push(<TaskWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<TaskWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<TaskWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;

                case WindowType.service:
                    contents.push(<ServiceWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<ServiceWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<ServiceWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;

                case WindowType.settings:
                    contents.push(<SettingsWindowContent key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    titles.push(<SettingsWindowTitle key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    functionButtons.push(<SettingsWindowFunctionButtons key={item.id} args={item as any} side={this.props.side} communicator={communicator} />);
                    break;
            }
        }

        return (
            <div className={less.WindowContainer} onClick={this._focusThisSide}>
                <div className={classnames(less.titleBar, { [less.titleBarFocused]: windowList.focusedSide.value === this.props.side })}>
                    <div className={less.tabs} onWheel={this._scrollTitleBar}>
                        {titles}
                    </div>
                    {functionButtons}
                </div>
                {contents}
            </div>
        );
    }
}