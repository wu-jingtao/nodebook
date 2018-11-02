import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../global/Tools/ObservableComponent';
import { CodeEditorWindowArgs, HtmlViewerWindowArgs, WindowType, MarkdownViewerWindowArgs, ImageViewerWindowArgs } from '../../ContentWindowTypes';
import { openWindow } from '../../WindowList';
import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { unsavedFiles, saveToServer, refreshData } from './CodeEditorFileCache';

export class CodeEditorWindowFunctionButtons extends BaseWindowFunctionButtons<CodeEditorWindowArgs> {

    private readonly _openHtmlViewer = () => {
        const args: HtmlViewerWindowArgs = {
            id: Math.random().toString(),
            name: `(查看) ${this.props.args.name}`,
            fixed: oVar(false),
            type: WindowType.html_viewer,
            args: {
                path: this.props.args.args.path
            }
        };

        openWindow(args, this.props.side === 'left' ? 'right' : 'left');
    };

    private readonly _openMarkdownViewer = () => {
        const args: MarkdownViewerWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: `(查看) ${this.props.args.name}`,
            type: WindowType.markdown_viewer,
            args: this.props.args.args
        };

        openWindow(args, this.props.side === 'left' ? 'right' : 'left');
    };

    private readonly _openImageViewer = () => {
        const args: ImageViewerWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: `(查看) ${this.props.args.name}`,
            type: WindowType.image_viewer,
            args: this.props.args.args
        };

        openWindow(args, this.props.side === 'left' ? 'right' : 'left');
    };

    private readonly _runTask = () => {

    };

    private readonly _stopTask = () => {

    };

    private readonly _openLog = () => {

    };

    protected _functionButtons: JSX.Element = (
        <>
            {this.props.args.args.path.endsWith('.html') &&
                <img src={`/static/res/img/buttons_icon/Preview_inverse.svg`}
                    title={`在HTML查看器中打开`} onClick={this._openHtmlViewer} />
            }
            {this.props.args.args.path.endsWith('.md') &&
                <img src={`/static/res/img/buttons_icon/Preview_inverse.svg`}
                    title={`在Markdown查看器中打开`} onClick={this._openMarkdownViewer} />
            }
            {this.props.args.args.path.endsWith('.svg') &&
                <img src={`/static/res/img/buttons_icon/Preview_inverse.svg`}
                    title={`在Image查看器中打开`} onClick={this._openImageViewer} />
            }
            {this.props.args.args.path.endsWith('.server.js') &&
                <img src={`/static/res/img/buttons_icon/start-inverse.svg`}
                    title={`运行任务`} onClick={this._runTask} />
            }
            {this.props.args.args.path.endsWith('.server.js') &&
                <img src={`/static/res/img/buttons_icon/stop-inverse.svg`}
                    title={`停止任务`} onClick={this._stopTask} />
            }
            {this.props.args.args.path.endsWith('.server.js') &&
                <img src={`/static/res/img/buttons_icon/repl-inverse.svg`}
                    title={`查看日志`} onClick={this._openLog} />
            }
            <ObservableComponentWrapper watch={[unsavedFiles]} render={() => (
                unsavedFiles.has(this.props.args.args.path) &&
                <img src={`/static/res/img/buttons_icon/check-inverse.svg`}
                    title={`保存更改`} onClick={() => saveToServer(this.props.args.args.path)} />
            )} />
            <img src={`/static/res/img/buttons_icon/Refresh_inverse.svg`}
                title={`刷新`} onClick={() => refreshData(this.props.args.args.path)} />
        </>
    );
}