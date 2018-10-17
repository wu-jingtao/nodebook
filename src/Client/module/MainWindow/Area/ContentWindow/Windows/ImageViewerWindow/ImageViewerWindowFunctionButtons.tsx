import * as React from 'react';
import { oVar } from 'observable-variable';

import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { ImageViewerWindowArgs, CodeEditorWindowArgs, WindowType } from '../../ContentWindowTypes';
import { openWindow } from '../../WindowList';

export class ImageViewerWindowFunctionButtons extends BaseWindowFunctionButtons<ImageViewerWindowArgs> {

    //在新的浏览器窗口中打开
    private readonly _openInBrowserWindow = () => {
        window.open('/file/api/readFile?path=' + this.props.args.args.path);
    };

    //刷新图片
    private readonly _refresh = () => {
        this.props.communicator.refresh();
    };

    //svg文件打开编辑器
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
        <>
            {this.props.args.name.endsWith('.svg') &&
                <img src={`/static/res/img/buttons_icon/edit_inverse.svg`}
                    title={`打开代码编辑器`} onClick={this._openEditor} />
            }
            <img src={`/static/res/img/buttons_icon/browser.svg`}
                style={{ width: '21px', height: '21px', padding: '7px' }}
                title={`在新的浏览器窗口中打开`} onClick={this._openInBrowserWindow} />
            <img src={`/static/res/img/buttons_icon/Refresh_inverse.svg`}
                title={`刷新`} onClick={this._refresh} />
        </>
    );
}