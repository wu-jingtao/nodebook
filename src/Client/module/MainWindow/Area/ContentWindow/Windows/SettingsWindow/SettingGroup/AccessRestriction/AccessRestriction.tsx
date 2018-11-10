import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable, oVar, watch } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { TextInput } from '../../../../../../../../global/Component/TextInput/TextInput';
import { Button } from '../../../../../../../../global/Component/Button/Button';
import { secretSettings } from '../../../../../../../../global/SystemSetting';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { inputPassword } from '../UsernameAndPassword/InputPassword';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";

const less_ProgramNameAndIcon = require('../ProgramNameAndIcon/ProgramNameAndIcon.less');
const less_UsernameAndPassword = require('../UsernameAndPassword/UsernameAndPassword.less');

export class AccessRestriction extends BaseSettingGroup {

    private readonly _secret_ipWhiteListRegexp = secretSettings.get('http.ipWhiteListRegexp') as ObservableVariable<string>;
    private readonly _secret_ipBlackListRegexp = secretSettings.get('http.ipBlackListRegexp') as ObservableVariable<string>;

    private readonly _ipWhiteListRegexp = oVar(this._secret_ipWhiteListRegexp.value);
    private readonly _ipBlackListRegexp = oVar(this._secret_ipBlackListRegexp.value);

    private readonly _ipWhiteListRegexp_changed = oVar(false);
    private readonly _ipBlackListRegexp_changed = oVar(false);

    private readonly _ipWhiteListRegexp_updating = oVar(false);
    private readonly _ipBlackListRegexp_updating = oVar(false);

    private readonly _userIp = oVar('0.0.0.0');

    //更改IP白名单
    private readonly _changeIpWhiteListRegexp = () => {
        const saveChange = async () => {
            const password = await inputPassword('修改IP白名单');
            if (password) {
                try {
                    this._ipWhiteListRegexp_updating.value = true;
                    await ServerApi.settings.changeSecretSetting('http.ipWhiteListRegexp', this._ipWhiteListRegexp.value, password);
                    this._ipWhiteListRegexp_changed.value = false;
                    this._secret_ipWhiteListRegexp.value = this._ipWhiteListRegexp.value;
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '修改IP白名单失败', content: error.message });
                } finally {
                    this._ipWhiteListRegexp_updating.value = false;
                }
            }
        };

        if (this._ipWhiteListRegexp.value && !(new RegExp(this._ipWhiteListRegexp.value).test(this._userIp.value))) {
            showPopupWindow({
                title: 'IP白名单限制提示',
                content: <span>检测发现当前用户IP不满足白名单条件，确认修改可能导致当前IP无法访问，是否继续?</span>,
                ok: { callback: saveChange }
            });
        } else
            saveChange();
    };

    //更改IP黑名单
    private readonly _changeIpBlackListRegexp = () => {
        const saveChange = async () => {
            const password = await inputPassword('修改IP黑名单');
            if (password) {
                try {
                    this._ipBlackListRegexp_updating.value = true;
                    await ServerApi.settings.changeSecretSetting('http.ipBlackListRegexp', this._ipBlackListRegexp.value, password);
                    this._ipBlackListRegexp_changed.value = false;
                    this._secret_ipBlackListRegexp.value = this._ipBlackListRegexp.value;
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '修改IP黑名单失败', content: error.message });
                } finally {
                    this._ipBlackListRegexp_updating.value = false;
                }
            }
        };

        if (this._ipBlackListRegexp.value && (new RegExp(this._ipBlackListRegexp.value).test(this._userIp.value))) {
            showPopupWindow({
                title: 'IP黑名单限制提示',
                content: <span>检测发现当前用户IP满足黑名单条件，确认修改可能导致当前IP无法访问，是否继续?</span>,
                ok: { callback: saveChange }
            });
        } else
            saveChange();
    };

    protected _groupName = '访问限制';

    protected _subGroup = [
        {
            name: '用户当前IP',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._userIp]}
                        render={() => <span style={{ userSelect: 'text' }}>{this._userIp.value}</span>} />
                )
            ]
        },
        {
            name: '访问IP白名单',
            description: '正则表达式 (如果设置了白名单则黑名单将失效)',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._ipWhiteListRegexp, this._ipWhiteListRegexp_changed, this._ipWhiteListRegexp_updating]} render={() => (
                        <>
                            <TextInput className={less_ProgramNameAndIcon.textInput} type="text" value={this._ipWhiteListRegexp}
                                placeholder="例如：^192.168.0.\d{0,3}$" disabled={this._ipWhiteListRegexp_updating.value} />
                            {this._ipWhiteListRegexp_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                loading={this._ipWhiteListRegexp_updating.value} onClick={this._changeIpWhiteListRegexp}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
        {
            name: '访问IP黑名单',
            description: '正则表达式',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._ipBlackListRegexp, this._ipBlackListRegexp_changed, this._ipBlackListRegexp_updating]} render={() => (
                        <>
                            <TextInput className={less_ProgramNameAndIcon.textInput} type="text" value={this._ipBlackListRegexp}
                                placeholder="例如：^192.168.0.(123|231)$" disabled={this._ipBlackListRegexp_updating.value} />
                            {this._ipBlackListRegexp_changed.value && <Button className={classnames(less_ProgramNameAndIcon.button, less_UsernameAndPassword.button)}
                                loading={this._ipBlackListRegexp_updating.value} onClick={this._changeIpBlackListRegexp}>确认修改</Button>}
                        </>
                    )} />
                )
            ]
        },
    ];

    componentDidMount() {
        ServerApi.others.getIP()
            .then(ip => this._userIp.value = ip)
            .catch(error => showMessageBox({ icon: 'error', title: '获取用户IP失败', content: error.message }));

        this._unobserve.push(watch([this._ipWhiteListRegexp], () => this._ipWhiteListRegexp_changed.value = true));
        this._unobserve.push(watch([this._ipBlackListRegexp], () => this._ipBlackListRegexp_changed.value = true));
    }
}