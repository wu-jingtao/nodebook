import * as React from 'react';

import { ObservableComponentWrapper } from '../../../../../../global/Tools/ObservableComponent';
import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { MindMapWindowArgs } from '../../ContentWindowTypes';
import { unsavedFiles, saveToServer, refreshData } from '../CodeEditorWindow/CodeEditorFileCache';

export class MindMapWindowFunctionButtons extends BaseWindowFunctionButtons<MindMapWindowArgs> {

    protected _functionButtons = (
        <>
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