import * as React from 'react';

import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { SettingsWindowArgs } from '../../ContentWindowTypes';

const less = require('./SettingsWindow.less');

export class SettingsWindowFunctionButtons extends BaseWindowFunctionButtons<SettingsWindowArgs> {

    protected _functionButtons: JSX.Element;
    
}