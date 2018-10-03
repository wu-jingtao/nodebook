import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';

const less = require('./CodeEditorWindow.less');

export const codeEditorWindowContentList = new Map<string, CodeEditorWindowContent>();

export class CodeEditorWindowContent extends BaseWindowContent<CodeEditorWindowArgs> {

    protected _content: JSX.Element = (
        <span style={{ color: 'white' }}>{this.props.args.args.path}</span>
    );

    protected _onFocused() {

    }

    componentDidMount() {
        super.componentDidMount();

        

        codeEditorWindowContentList.set(this.props.args.id, this);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        codeEditorWindowContentList.delete(this.props.args.id);
    }
}