import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { TaskWindowArgs } from '../../ContentWindowTypes';

const less = require('./TaskWindow.less');

export class TaskWindowContent extends BaseWindowContent<TaskWindowArgs> {
    protected _content: JSX.Element;
    protected _onFocused(): void {
    }
  

}