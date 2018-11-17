import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { TextInput } from '../../../../../../../../global/Component/TextInput/TextInput';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';

const less = require('./UsernameAndPassword.less');

/**
 * 用户输入密码弹窗
 * @param title 弹窗标题
 * @param placeholder 输入框提示文字
 */
export function inputPassword(title: string, placeholder: string = '请输入用户密码'): Promise<string> {
    return new Promise(resolve => {
        const password = oVar('');

        showPopupWindow({
            title,
            content: <ObservableComponentWrapper watch={[password]}
                render={() => <TextInput className={less.inputUserPassword} type="password" value={password} placeholder={placeholder} />} />,
            ok: {
                callback() { resolve(password.value) }
            },
            cancel: {
                callback() { resolve('') }
            }
        });
    });
}