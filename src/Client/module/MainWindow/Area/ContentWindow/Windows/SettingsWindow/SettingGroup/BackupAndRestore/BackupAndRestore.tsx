import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, oVar, watch, oArr } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { NumberInput } from '../../../../../../../../global/Component/NumberInput/NumberInput';
import { CheckBox } from '../../../../../../../../global/Component/CheckBox/CheckBox';
import { Button } from '../../../../../../../../global/Component/Button/Button';
import { DropDownList } from '../../../../../../../../global/Component/DropDownList/DropDownList';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { secretSettings } from '../../../../../../../../global/SystemSetting';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { inputPassword } from '../UsernameAndPassword/InputPassword';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";

const less = require('./BackupAndRestore.less');
const less_CodeEditor = require('../CodeEditor/CodeEditor.less');
const less_Mail = require('../Mail/Mail.less');
const less_ProgramNameAndIcon = require('../ProgramNameAndIcon/ProgramNameAndIcon.less');
const less_UsernameAndPassword = require('../UsernameAndPassword/UsernameAndPassword.less');

export class BackupAndRestore extends BaseSettingGroup {

    private readonly _secret_interval = secretSettings.get('backup.interval') as ObservableVariable<number>;
    private readonly _secret_maxNumber = secretSettings.get('backup.maxNumber') as ObservableVariable<number>;
    private readonly _secret_autoSendEmail = secretSettings.get('backup.autoSendEmail') as ObservableVariable<boolean>;
    private readonly _secret_encryptEmailFile = secretSettings.get('backup.encryptEmailFile') as ObservableVariable<boolean>;

    private readonly _interval = oVar(this._secret_interval.value);
    private readonly _maxNumber = oVar(this._secret_maxNumber.value);
    private readonly _autoSendEmail = oVar(this._secret_autoSendEmail.value);
    private readonly _encryptEmailFile = oVar(this._secret_encryptEmailFile.value);

    private readonly _interval_changed = oVar(false);
    private readonly _maxNumber_changed = oVar(false);
    private readonly _autoSendEmail_changed = oVar(false);
    private readonly _encryptEmailFile_changed = oVar(false);

    private readonly _interval_updating = oVar(false);
    private readonly _maxNumber_updating = oVar(false);
    private readonly _autoSendEmail_updating = oVar(false);
    private readonly _encryptEmailFile_updating = oVar(false);

    private readonly _backupList = oArr<string>([]);        //备份文件列表
    private readonly _selectedBackupFile = oVar('');        //选中的备份文件

    private readonly _sendingBackupEmail = oVar(false);     //正在发送备份邮件
    private readonly _deletingBackupFiles = oVar(false);
    private readonly _creatingBackupFile = oVar(false);
    private readonly _resumingFromBackup = oVar(false);
    private readonly _disableBackupButton = oVar(false);    //禁用备份相关的按钮

    //更改自动备份时间间隔
    private readonly _changeInterval = async () => {
        const password = await inputPassword('修改自动备份时间间隔');
        if (password) {
            try {
                this._interval_updating.value = true;
                await ServerApi.settings.changeSecretSetting('backup.interval', this._interval.value, password);
                this._interval_changed.value = false;
                this._secret_interval.value = this._interval.value;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改自动备份时间间隔失败', content: error.message });
            } finally {
                this._interval_updating.value = false;
            }
        }
    };

    //更改最大备份保存数
    private readonly _changeMaxNumber = async () => {
        const password = await inputPassword('修改最大备份保存数');
        if (password) {
            try {
                this._maxNumber_updating.value = true;
                await ServerApi.settings.changeSecretSetting('backup.maxNumber', this._maxNumber.value, password);
                this._maxNumber_changed.value = false;
                this._secret_maxNumber.value = this._maxNumber.value;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改最大备份保存数失败', content: error.message });
            } finally {
                this._maxNumber_updating.value = false;
            }
        }
    };

    //更改自动发送备份数据
    private readonly _changeAutoSendEmail = async () => {
        const password = await inputPassword('修改自动发送备份数据');
        if (password) {
            try {
                this._autoSendEmail_updating.value = true;
                await ServerApi.settings.changeSecretSetting('backup.autoSendEmail', this._autoSendEmail.value, password);
                this._autoSendEmail_changed.value = false;
                this._secret_autoSendEmail.value = this._autoSendEmail.value;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改自动发送备份数据失败', content: error.message });
            } finally {
                this._autoSendEmail_updating.value = false;
            }
        }
    };

    //更改加密发送备份数据
    private readonly _changeEncryptEmailFile = async () => {
        const password = await inputPassword('修改加密发送备份数据');
        if (password) {
            try {
                this._encryptEmailFile_updating.value = true;
                await ServerApi.settings.changeSecretSetting('backup.encryptEmailFile', this._encryptEmailFile.value, password);
                this._encryptEmailFile_changed.value = false;
                this._secret_encryptEmailFile.value = this._encryptEmailFile.value;
            } catch (error) {
                showMessageBox({ icon: 'error', title: '修改加密发送备份数据失败', content: error.message });
            } finally {
                this._encryptEmailFile_updating.value = false;
            }
        }
    };

    //下载备份数据
    private readonly _downloadBackupFile = () => {
        if (this._selectedBackupFile.value) {
            window.open(`/backup/readBackupFile?filename=${this._selectedBackupFile.value}`);
        }
    };

    //发送备份数据到用户邮箱
    private readonly _sendBackupFile = async () => {
        if (this._selectedBackupFile.value) {
            try {
                this._sendingBackupEmail.value = true;
                this._disableBackupButton.value = true;
                await ServerApi.backup.sendBackupEmail(this._selectedBackupFile.value);
                showMessageBox({ icon: 'ok', title: '发送成功' });
            } catch (error) {
                showMessageBox({ icon: 'error', title: '发送备份数据到用户邮箱失败', content: error.message });
            } finally {
                this._sendingBackupEmail.value = false;
                this._disableBackupButton.value = false;
            }
        }
    };

    //删除备份数据
    private readonly _deleteBackupFile = async () => {
        if (this._selectedBackupFile.value) {
            try {
                this._deletingBackupFiles.value = true;
                this._disableBackupButton.value = true;
                await ServerApi.backup.deleteBackupFiles(this._selectedBackupFile.value);
                showMessageBox({ icon: 'ok', title: '删除成功' });
                this._backupList.delete(this._selectedBackupFile.value);
            } catch (error) {
                showMessageBox({ icon: 'error', title: '删除备份数据失败', content: error.message });
            } finally {
                this._deletingBackupFiles.value = false;
                this._disableBackupButton.value = false;
            }
        }
    };

    //创建备份数据
    private readonly _createBackupFile = async () => {
        try {
            this._creatingBackupFile.value = true;
            const filename = await ServerApi.backup.createBackupFile();
            showMessageBox({ icon: 'ok', title: '创建成功', content: filename });
            this._backupList.push(filename);
        } catch (error) {
            showMessageBox({ icon: 'error', title: '创建备份数据失败', content: error.message });
        } finally {
            this._creatingBackupFile.value = false;
        }
    };

    //从备份中恢复数据
    private readonly _resumeBackupFile = async () => {
        if (this._selectedBackupFile.value) {
            showPopupWindow({
                title: '从备份中恢复数据',
                content: <span>确定要恢复数据吗? 恢复数据将导致用户数据目录下的内容被覆盖，回收站被清空，服务器重启。</span>,
                ok: {
                    callback: async () => {
                        const password = await inputPassword('从备份中恢复数据');
                        if (password) {
                            try {
                                this._resumingFromBackup.value = true;
                                this._disableBackupButton.value = true;
                                await ServerApi.backup.resumeFromBackup(this._selectedBackupFile.value, password);
                                showMessageBox({ icon: 'message', title: '开始恢复', content: '恢复过程中将导致与服务器连接断开，恢复成功后服务器会自动重启' });
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '从备份中恢复数据失败', content: error.message });
                            } finally {
                                this._resumingFromBackup.value = false;
                                this._disableBackupButton.value = false;
                            }
                        }
                    }
                }
            });
        }
    };

    protected _groupName = '数据备份与恢复';

    protected _subGroup = [
        {
            name: '备份文件列表',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._backupList, this._selectedBackupFile]} render={() => {
                        let options: { text: string, value: string }[];

                        if (this._backupList.length === 0)
                            options = [{ text: '没有备份数据', value: '' }];
                        else {
                            options = this._backupList.map(item => ({ text: item, value: item }));
                            options.unshift({ text: '请选择备份数据', value: '' });
                        }

                        return <DropDownList className={less_Mail.DropDownList} value={this._selectedBackupFile} options={options} />;
                    }} />
                ),
                (
                    <>
                        <ObservableComponentWrapper watch={[this._disableBackupButton]} render={() => <Button className={less_ProgramNameAndIcon.button}
                            disabled={this._disableBackupButton.value} onClick={this._downloadBackupFile}>下载备份数据</Button>} />
                        <ObservableComponentWrapper watch={[this._sendingBackupEmail, this._disableBackupButton]}
                            render={() => <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                disabled={this._disableBackupButton.value} loading={this._sendingBackupEmail.value} onClick={this._sendBackupFile}>发送备份数据到用户邮箱</Button>} />
                        <ObservableComponentWrapper watch={[this._deletingBackupFiles, this._disableBackupButton]}
                            render={() => <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                disabled={this._disableBackupButton.value} loading={this._deletingBackupFiles.value} onClick={this._deleteBackupFile}>删除备份数据</Button>} />
                        <ObservableComponentWrapper watch={[this._resumingFromBackup, this._disableBackupButton]}
                            render={() => <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                disabled={this._disableBackupButton.value} loading={this._resumingFromBackup.value} onClick={this._resumeBackupFile}>从备份中恢复数据</Button>} />
                    </>
                )
            ]
        },
        {
            name: '创建备份数据',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._creatingBackupFile]} render={() => <Button className={less_ProgramNameAndIcon.button}
                        loading={this._creatingBackupFile.value} onClick={this._createBackupFile}>立即备份</Button>} />
                )
            ]
        },
        {
            name: '自动备份时间间隔',
            description: '(天)。如果设置为0则表示不自动备份',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._interval, this._interval_changed, this._interval_updating]} render={() => (
                        <>
                            <NumberInput className={less_CodeEditor.numberInput} min={0} max={20} step={1} value={this._interval} disabled={this._interval_updating.value} />
                            {this._interval_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                loading={this._interval_updating.value} onClick={this._changeInterval}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
        {
            name: '最大备份保存数',
            description: '最多保存多少个备份，超过最大备份数后，最旧的一个备份将会被删除',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._maxNumber, this._maxNumber_changed, this._maxNumber_updating]} render={() => (
                        <>
                            <NumberInput className={less_CodeEditor.numberInput} min={1} max={999} step={1} value={this._maxNumber} disabled={this._maxNumber_updating.value} />
                            {this._maxNumber_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                loading={this._maxNumber_updating.value} onClick={this._changeMaxNumber}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
        {
            name: '自动发送备份数据',
            description: '是否每当有新的备份产生时自动将备份数据发送到用户邮箱',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._autoSendEmail, this._autoSendEmail_changed, this._autoSendEmail_updating]} render={() => (
                        <>
                            <CheckBox text="开启自动发送备份数据" value={this._autoSendEmail} disabled={this._autoSendEmail_updating.value} />
                            {this._autoSendEmail_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less.checkboxButton)}
                                loading={this._autoSendEmail_updating.value} onClick={this._changeAutoSendEmail}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
        {
            name: '加密发送备份数据',
            description: '是否加密发送到邮箱的备份数据，密码是用户密码的MD5值',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._encryptEmailFile, this._encryptEmailFile_changed, this._encryptEmailFile_updating]} render={() => (
                        <>
                            <CheckBox text="开启加密发送备份数据" value={this._encryptEmailFile} disabled={this._encryptEmailFile_updating.value} />
                            {this._encryptEmailFile_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less.checkboxButton)}
                                loading={this._encryptEmailFile_updating.value} onClick={this._changeEncryptEmailFile}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
    ];

    componentDidMount() {
        ServerApi.backup.listBackupFiles()
            .then(list => this._backupList.value = list)
            .catch(error => showMessageBox({ icon: 'error', title: '读取备份数据列表失败', content: error.message }));

        this._unobserve.push(watch([this._interval], () =>
            this._interval_changed.value = this._interval.value !== this._secret_interval.value));
        this._unobserve.push(watch([this._maxNumber], () =>
            this._maxNumber_changed.value = this._maxNumber.value !== this._secret_maxNumber.value));
        this._unobserve.push(watch([this._autoSendEmail], () =>
            this._autoSendEmail_changed.value = this._autoSendEmail.value !== this._secret_autoSendEmail.value));
        this._unobserve.push(watch([this._encryptEmailFile], () =>
            this._encryptEmailFile_changed.value = this._encryptEmailFile.value !== this._secret_encryptEmailFile.value));
    }
}