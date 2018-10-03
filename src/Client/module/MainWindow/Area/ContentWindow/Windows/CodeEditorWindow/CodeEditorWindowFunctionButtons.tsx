import * as React from 'react';

import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { CodeEditorWindowArgs, HtmlViewerWindowArgs, WindowType } from '../../ContentWindowTypes';
import { openWindow } from '../../WindowList';
import { oVar } from 'observable-variable';

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

        openWindow(args);
    };

    private readonly _refresh = () => {

    };

    private readonly _runTask = () => {

    };

    private readonly _stopTask = () => {

    };

    private readonly _openLog = () => {

    };

    protected _functionButtons: JSX.Element = (
        <>
            {this.props.args.name.endsWith('.html') &&
                <img src={`/static/res/img/buttons_icon/Preview_inverse.svg`}
                    title={`在HTML查看器中打开`}
                    onClick={this._openHtmlViewer} />
            }
            {this.props.args.name.endsWith('.server.js') &&
                <img src={`/static/res/img/buttons_icon/start-inverse.svg`}
                    title={`运行任务`}
                    onClick={this._runTask} />
            }
            {this.props.args.name.endsWith('.server.js') &&
                <img src={`/static/res/img/buttons_icon/stop-inverse.svg`}
                    title={`停止任务`}
                    onClick={this._stopTask} />
            }
            {this.props.args.name.endsWith('.server.js') &&
                <img src={`/static/res/img/buttons_icon/repl-inverse.svg`}
                    title={`查看日志`}
                    onClick={this._openLog} />
            }
            <img src={`/static/res/img/buttons_icon/Refresh_inverse.svg`}
                title={`刷新`}
                onClick={this._refresh} />
        </>
    );
}