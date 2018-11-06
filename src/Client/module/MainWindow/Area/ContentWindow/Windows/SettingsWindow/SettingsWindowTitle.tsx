import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { SettingsWindowArgs } from '../../ContentWindowTypes';

export class SettingsWindowTitle extends BaseWindowTitle<SettingsWindowArgs> {
    protected _icon = '/static/res/img/file_icons/file_type_ini.svg';
    protected _prompt = '设置';
}