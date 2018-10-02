import * as React from 'react';

import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { TaskWindowArgs } from '../../ContentWindowTypes';

const less = require('./TaskWindow.less');

export class TaskWindowFunctionButtons extends BaseWindowFunctionButtons<TaskWindowArgs> {

    protected _functionButtons: JSX.Element;

}