import * as React from 'react';
import { oVar } from 'observable-variable';

import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { MarkdownViewerWindowArgs, CodeEditorWindowArgs, WindowType } from '../../ContentWindowTypes';
import { openWindow } from '../../WindowList';

export class MarkdownViewerWindowFunctionButtons extends BaseWindowFunctionButtons<MarkdownViewerWindowArgs> {

    private readonly _openEditor = () => {
        const args: CodeEditorWindowArgs = {
            id: Math.random().toString(),
            fixed: oVar(false),
            name: this.props.args.args.path.split('/').pop() as string,
            type: WindowType.code_editor,
            args: this.props.args.args
        };

        openWindow(args, this.props.side === 'left' ? 'right' : 'left');
    };

    protected _functionButtons = (
        <img src={`/static/res/img/buttons_icon/edit_inverse.svg`}
            title={`打开代码编辑器`} onClick={this._openEditor} />
    );
}