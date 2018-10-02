import * as React from 'react';

import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { ServiceWindowArgs } from '../../ContentWindowTypes';

const less = require('./ServiceWindow.less');

export class ServiceWindowFunctionButtons extends BaseWindowFunctionButtons<ServiceWindowArgs> {

    protected _functionButtons: JSX.Element;
    
}