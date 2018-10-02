import * as React from 'react';

import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';

export class CodeEditorWindowFunctionButtons extends BaseWindowFunctionButtons<CodeEditorWindowArgs> {
    protected _functionButtons: JSX.Element;
}