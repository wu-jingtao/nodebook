import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { ServiceWindowArgs } from '../../ContentWindowTypes';

/**
 * 顶部选项卡标题栏
 */
export class ServiceWindowTitle extends BaseWindowTitle<ServiceWindowArgs> {
    protected _icon: string;
    protected _title: string;
    protected _prompt: string;
}