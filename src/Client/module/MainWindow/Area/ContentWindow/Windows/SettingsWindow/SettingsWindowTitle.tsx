import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { SettingsWindowArgs } from '../../ContentWindowTypes';

/**
 * 顶部选项卡标题栏
 */
export class SettingsWindowTitle extends BaseWindowTitle<SettingsWindowArgs> {
    protected _icon: string;
    protected _title: string;
    protected _prompt: string;
}