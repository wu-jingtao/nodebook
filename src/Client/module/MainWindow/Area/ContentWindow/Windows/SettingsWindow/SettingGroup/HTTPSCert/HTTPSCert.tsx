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

export class HTTPSCert extends BaseSettingGroup {

    private readonly _regenerating = oVar(false);

    //重新生成HTTPS证书
    private readonly _regenerate = async () => {
        showPopupWindow({
            title: '重新生成HTTPS证书',
            content: <span>确定要重新生成HTTPS证书吗? 重新生成后原先设置的证书将会被覆盖。重新生成的证书是自签名的。</span>,
            ok: {
                callback: async () => {
                    const password = await inputPassword('重新生成HTTPS证书');
                    if (password) {
                        try {
                            this._regenerating.value = true;
                            await ServerApi.others.regenerateCert(password);
                            showMessageBox({ icon: 'ok', title: '重新生成HTTPS证书成功', content: '重启服务器后生效' });
                        } catch (error) {
                            showMessageBox({ icon: 'error', title: '重新生成HTTPS证书失败', content: error.message });
                        } finally {
                            this._regenerating.value = false;
                        }
                    }
                }
            }
        });
    };

    protected _groupName = 'HTTPS证书';

    protected _subGroup = [
        {
            name: '重新生成HTTPS证书',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._regenerating]} render={() => <Button className={less_ProgramNameAndIcon.button}
                        loading={this._regenerating.value} onClick={this._regenerate}>重新生成</Button>} />
                )
            ]
        }
    ];
}