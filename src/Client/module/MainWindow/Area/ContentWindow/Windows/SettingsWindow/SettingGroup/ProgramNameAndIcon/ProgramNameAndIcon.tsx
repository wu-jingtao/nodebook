import * as React from 'react';
import * as $ from 'jquery';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { CheckBox } from '../../../../../../../../global/Component/CheckBox/CheckBox';
import { TextInput } from '../../../../../../../../global/Component/TextInput/TextInput';
import { Button } from '../../../../../../../../global/Component/Button/Button';
import { normalSettings } from '../../../../../../../../global/SystemSetting';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { BaseSettingGroup } from '../BaseSettingGroup/BaseSettingGroup';

const less = require('./ProgramNameAndIcon.less');
const sidebar_less = require('../../../../../SideBar/SideBar.less');
const failed_image = require('!url-loader!../../../ImageViewerWindow/image_fail.png');

export class ProgramNameAndIcon extends BaseSettingGroup {

    private readonly _programName = normalSettings.get('client.programName') as ObservableVariable<string>;
    private readonly _sidebar_showLogo = normalSettings.get('client.sidebar.showLogo') as ObservableVariable<boolean>;
    private readonly _sidebar_logoPadding = normalSettings.get('client.sidebar.logoPadding') as ObservableVariable<boolean>;

    private _login_brand_img: HTMLImageElement;
    private _sidebar_logo_img: HTMLImageElement;
    private _browser_favicon_img: HTMLImageElement;

    //更换登录页面图片
    private readonly _changeLoginBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && e.target.files[0].type === 'image/png') {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);
            fileReader.onload = (e: any) => {
                this._login_brand_img.src = e.target.result;
            };

            ServerApi.logo.changeLoginBrand(e.target.files[0]).catch(e =>
                showMessageBox({ icon: 'error', title: '修改登录页图片失败', content: e.message }));
        }
    };

    //更换侧边栏图标
    private readonly _changeSidebarLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && e.target.files[0].type === 'image/png') {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);
            fileReader.onload = (e: any) => {
                this._sidebar_logo_img.src = e.target.result;
                $(`img.${sidebar_less.logo}`).prop('src', e.target.result);
            };

            ServerApi.logo.changeSidebarLogo(e.target.files[0]).catch(e =>
                showMessageBox({ icon: 'error', title: '修改侧边栏图标失败', content: e.message }));
        }
    };

    //更换浏览器图标
    private readonly _changeBrowserFavicon = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && e.target.files[0].type === 'image/x-icon') {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);
            fileReader.onload = (e: any) => {
                this._browser_favicon_img.src = e.target.result;
                $("head > link[rel='shortcut icon']").prop('href', e.target.result);
            };

            ServerApi.logo.changeFavicon(e.target.files[0]).catch(e =>
                showMessageBox({ icon: 'error', title: '修改浏览器小图标失败', content: e.message }));
        }
    };

    //重置名称与图标
    private readonly _resetProgramNameAndIcon = () => {
        showPopupWindow({
            title: '重置名称与图标',
            content: <span>确定要重置吗?</span>,
            ok: {
                callback: async () => {
                    try {
                        await ServerApi.logo.resetLogo();

                        this._programName.value = 'NodeBook';
                        
                        this._login_brand_img.src = `/logo/brand.png?_=${Math.random()}`;

                        this._sidebar_logo_img.src = `/logo/icon.png?_=${Math.random()}`;
                        $(`img.${sidebar_less.logo}`).prop('src', this._sidebar_logo_img.src);

                        this._browser_favicon_img.src = `/logo/favicon.ico?_=${Math.random()}`;
                        $("head > link[rel='shortcut icon']").prop('href', this._browser_favicon_img.src);
                    } catch (error) {
                        showMessageBox({ icon: 'error', title: '重置名称与图标失败', content: error.message });
                    }
                }
            }
        });
    };

    protected _groupName = '程序名称与图标';

    protected _subGroup = [
        {
            name: '程序名称',
            items: [
                (
                    <ObservableComponentWrapper watch={[this._programName]}
                        render={() => <TextInput type="text" className={less.textInput} maxLength={50} value={this._programName} />} />
                )
            ]
        },
        {
            name: '登录页图片',
            items: [
                (
                    <div className={less.selectImage}>
                        <img src="/logo/brand.png" onError={e => e.currentTarget.src = failed_image} ref={(e: any) => this._login_brand_img = e} />
                        <label><input type="file" accept="image/png" onChange={this._changeLoginBrand} /><span>更换图片</span></label>
                    </div>
                )
            ]
        },
        {
            name: '侧边栏Logo',
            items: [
                (
                    <div className={less.selectImage}>
                        <img src="/logo/icon.png" onError={e => e.currentTarget.src = failed_image} ref={(e: any) => this._sidebar_logo_img = e} />
                        <label><input type="file" accept="image/png" onChange={this._changeSidebarLogo} /><span>更换图标</span></label>
                    </div>
                ),
                (
                    <ObservableComponentWrapper watch={[this._sidebar_showLogo]}
                        render={() => <CheckBox text="是否显示Logo" value={this._sidebar_showLogo} />} />
                ),
                (
                    <ObservableComponentWrapper watch={[this._sidebar_logoPadding]}
                        render={() => <CheckBox text="是否为Logo添加一些边距" value={this._sidebar_logoPadding} />} />
                )
            ]
        },
        {
            name: '浏览器小图标',
            items: [
                (
                    <div className={less.selectImage}>
                        <img src="/logo/favicon.ico" onError={e => e.currentTarget.src = failed_image} ref={(e: any) => this._browser_favicon_img = e} />
                        <label><input type="file" accept="image/x-icon" onChange={this._changeBrowserFavicon} /><span>更换图标</span></label>
                    </div>
                )
            ]
        },
        {
            name: '重置名称与图标',
            description: '将程序名称和所有图标恢复成系统初始状态',
            items: [
                (
                    <Button className={less.button} onClick={this._resetProgramNameAndIcon}>重置</Button>
                )
            ]
        }
    ];
}