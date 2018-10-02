import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { TaskWindowArgs } from '../../ContentWindowTypes';

/**
 * 顶部选项卡标题栏
 */
export class TaskWindowTitle extends BaseWindowTitle<TaskWindowArgs> {
    protected _icon: string;
    protected _title: string;
    protected _prompt: string;
}