import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { TaskWindowArgs } from '../../ContentWindowTypes';
import { TaskWindowChart } from './TaskWindowChart/TaskWindowChart';

export class TaskWindowContent extends BaseWindowContent<TaskWindowArgs> {
    protected _content = <TaskWindowChart taskPath={this.props.args.args.path} />
}