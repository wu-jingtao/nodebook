import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, oVar, watch } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { DropDownList } from '../../../../../../../../global/Component/DropdownList/DropdownList';
import { TextInput } from '../../../../../../../../global/Component/TextInput/TextInput';
import { Button } from '../../../../../../../../global/Component/Button/Button';
import { secretSettings } from '../../../../../../../../global/SystemSetting';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";
import { inputPassword } from '../UsernameAndPassword/InputPassword';

const less = require('./Mail.less');
const less_UsernameAndPassword = require('../UsernameAndPassword/UsernameAndPassword.less');
const less_ProgramNameAndIcon = require('../ProgramNameAndIcon/ProgramNameAndIcon.less');

//邮件服务商列表
const nodemailer_services_list = Object.keys(require('nodemailer/lib/well-known/services.json')).map(item => ({ text: item, value: item }));
nodemailer_services_list.unshift({ text: '请选择', value: '' });

export class Mail extends BaseSettingGroup {

    private readonly _secret_service = secretSettings.get('mail.service') as ObservableVariable<string>;
    private readonly _secret_username = secretSettings.get('mail.user') as ObservableVariable<string>;

    private readonly _service = oVar(this._secret_service.value);
    private readonly _username = oVar(this._secret_username.value);
    private readonly _password = oVar('');

    private readonly _service_changed = oVar(false);
    private readonly _username_changed = oVar(false);
    private readonly _password_changed = oVar(false);

    private readonly _service_updating = oVar(false);
    private readonly _username_updating = oVar(false);
    private readonly _password_updating = oVar(false);
    private readonly _sendingTestMail = oVar(false);

    //修改邮件服务提供商
    private readonly _change_service = async () => {
        const password = await inputPassword('修改邮件服务提供商');
        if (password) {
            try {
                this._service_updating.value = true;
                await ServerApi.settings.changeSecretSetting('mail.service', this._service.value, password);
                this._service_changed.value = false;
                this._secret_service.value = this._service.value;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改邮件服务提供商失败', content: error.message });
            } finally {
                this._service_updating.value = false;
            }
        }
    };

    //修改邮箱地址
    private readonly _changeUsername = async () => {
        const password = await inputPassword('修改邮箱地址');
        if (password) {
            try {
                this._username_updating.value = true;
                await ServerApi.settings.changeSecretSetting('mail.user', this._username.value, password);
                this._username_changed.value = false;
                this._secret_username.value = this._username.value;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改邮箱地址失败', content: error.message });
            } finally {
                this._username_updating.value = false;
            }
        }
    };

    //修改邮箱密码
    private readonly _changePassword = async () => {
        const password = await inputPassword('修改邮箱密码');
        if (password) {
            try {
                this._password_updating.value = true;
                await ServerApi.settings.changeSecretSetting('mail.pass', this._password.value, password);
                this._password_changed.value = false;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改邮箱密码失败', content: error.message });
            } finally {
                this._password_updating.value = false;
            }
        }
    };

    //发送测试邮件
    private readonly _sendTestMail = async () => {
        try {
            this._sendingTestMail.value = true;
            await ServerApi.others.sendTestMail();
            showMessageBox({ icon: 'ok', title: '发送测试邮件成功' });
        } catch (error) {
            showMessageBox({ icon: 'error', title: '发送测试邮件失败', content: error.message });
        } finally {
            this._sendingTestMail.value = false;
        }
    };

    protected _groupName = '邮件服务';

    protected _subGroup = [
        {
            name: '邮件服务商',
            description: '选择发送电子邮件服务的提供商',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._service, this._service_changed, this._service_updating]} render={() => (
                        <>
                            <DropDownList className={less.DropDownList} value={this._service} options={nodemailer_services_list} />
                            {this._service_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                loading={this._service_updating.value} onClick={this._change_service}>确认修改</Button>}
                        </>
                    )} />
                ),
            ]
        },
        {
            name: '邮箱地址',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._username, this._username_changed, this._username_updating]} render={() => (
                        <>
                            <TextInput className={less_ProgramNameAndIcon.textInput} type="email" value={this._username} />
                            {this._username_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                loading={this._username_updating.value} onClick={this._changeUsername}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
        {
            name: '密码',
            description: '邮箱密码或口令',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._password, this._password_changed, this._password_updating]} render={() => (
                        <>
                            <TextInput className={less_ProgramNameAndIcon.textInput} type="text" value={this._password} placeholder="新密码" />
                            {this._password_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                loading={this._password_updating.value} onClick={this._changePassword}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
        {
            name: '邮件服务测试',
            description: '发送一封测试邮件来检测配置是否正确',
            items: [
                <ObservableComponentWrapper watch={[this._sendingTestMail]} render={() => <Button className={classnames(less_ProgramNameAndIcon.button)}
                    loading={this._sendingTestMail.value} onClick={this._sendTestMail}>发送测试邮件</Button>} />
            ]
        }
    ];

    componentDidMount() {
        this._unobserve.push(watch([this._service], () => this._service_changed.value = true));
        this._unobserve.push(watch([this._username], () => this._username_changed.value = true));
        this._unobserve.push(watch([this._password], () => this._password_changed.value = true));
    }
}