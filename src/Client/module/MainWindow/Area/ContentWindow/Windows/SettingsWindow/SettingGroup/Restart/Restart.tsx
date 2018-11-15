import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { Button } from '../../../../../../../../global/Component/Button/Button';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { inputPassword } from '../UsernameAndPassword/InputPassword';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";

const less_ProgramNameAndIcon = require('../ProgramNameAndIcon/ProgramNameAndIcon.less');

export class Restart extends BaseSettingGroup {

    private readonly _restarting = oVar(false);

    //重启系统
    private readonly _restart = async () => {
        showPopupWindow({
            title: '重启系统',
            content: <span>确定要重启系统吗?</span>,
            ok: {
                callback: async () => {
                    const password = await inputPassword('重启系统');
                    if (password) {
                        try {
                            this._restarting.value = true;
                            await ServerApi.others.restart(password);
                            showMessageBox({ icon: 'message', title: '开始重启', content: '重启过程中将导致与服务器连接断开' });
                        } catch (error) {
                            showMessageBox({ icon: 'error', title: '重启系统失败', content: error.message });
                        } finally {
                            this._restarting.value = false;
                        }
                    }
                }
            }
        });
    };

    protected _groupName = '重启系统';

    protected _subGroup = [
        {
            name: '重启系统',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._restarting]} render={() => <Button className={less_ProgramNameAndIcon.button}
                        loading={this._restarting.value} onClick={this._restart}>重启</Button>} />
                )
            ]
        }
    ];
}