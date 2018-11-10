import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, oVar, watch } from 'observable-variable';
import md5 = require('blueimp-md5');

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { TextInput } from '../../../../../../../../global/Component/TextInput/TextInput';
import { Button } from '../../../../../../../../global/Component/Button/Button';
import { secretSettings } from '../../../../../../../../global/SystemSetting';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";
import { inputPassword } from './InputPassword';

const less = require('./UsernameAndPassword.less');
const less_ProgramNameAndIcon = require('../ProgramNameAndIcon/ProgramNameAndIcon.less');

export class UsernameAndPassword extends BaseSettingGroup {

    private readonly _secret_username = secretSettings.get('user.name') as ObservableVariable<string>;

    private readonly _username = oVar(this._secret_username.value);
    private readonly _password = oVar('');

    private readonly _username_changed = oVar(false);
    private readonly _password_changed = oVar(false);

    private readonly _username_updating = oVar(false);
    private readonly _password_updating = oVar(false);

    //更改用户名
    private readonly _changeUsername = async () => {
        const password = await inputPassword('修改用户名');
        if (password) {
            try {
                this._username_updating.value = true;
                await ServerApi.settings.changeSecretSetting('user.name', this._username.value, password);
                this._username_changed.value = false;
                this._secret_username.value = this._username.value;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改用户名失败', content: error.message });
            } finally {
                this._username_updating.value = false;
            }
        }
    };

    //更改密码
    private readonly _changePassword = async () => {
        if (this._password.value.length >= 6) {
            const old_password = await inputPassword('修改密码', '请输入旧密码');
            if (old_password) {
                try {
                    this._password_updating.value = true;
                    await ServerApi.settings.changeSecretSetting('user.password', md5(this._password.value), old_password);
                    this._password_changed.value = false;
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '修改密码失败', content: error.message });
                } finally {
                    this._password_updating.value = false;
                }
            }
        } else
            showMessageBox({ icon: 'error', title: '密码的长度不能小于6位' });
    };

    protected _groupName = '用户名与密码';

    protected _subGroup = [
        {
            name: '用户名',
            description: '必须是电子邮箱格式',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._username, this._username_changed, this._username_updating]} render={() => (
                        <>
                            <TextInput className={less_ProgramNameAndIcon.textInput} type="email" value={this._username} disabled={this._username_updating.value} />
                            {this._username_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less.button)}
                                loading={this._username_updating.value} onClick={this._changeUsername}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
        {
            name: '密码',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._password, this._password_changed, this._password_updating]} render={() => (
                        <>
                            <TextInput className={less_ProgramNameAndIcon.textInput} type="text" value={this._password} placeholder="新密码" disabled={this._password_updating.value} />
                            {this._password_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less.button)}
                                loading={this._password_updating.value} onClick={this._changePassword}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
    ];

    componentDidMount() {
        this._unobserve.push(watch([this._username], () => this._username_changed.value = true));
        this._unobserve.push(watch([this._password], () => this._password_changed.value = true));
    }
}