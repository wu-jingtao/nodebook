import * as React from 'react';
import * as classnames from 'classnames';
import { oArr, oVar } from 'observable-variable';
import debounce = require('lodash.debounce');

import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';
import { Container } from '../../../../../../../../global/Component/Container/Container';
import { ScrollBar } from '../../../../../../../../global/Component/ScrollBar/ScrollBar';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { showPopupWindow } from '../../../../../../../PopupWindow/PopupWindow';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";
import { InputPackageName } from './InputPackageName/InputPackageName';

const less = require('./Library.less');

export class Library extends BaseSettingGroup {

    //已安装的类库列表
    private readonly _installedList = oArr<{ name: string, version: string }>([]);

    //正在处理中的类库名称
    private readonly _processingList = oArr<string>([]);

    //安装新的类库
    private readonly _installNewPackage = () => {
        const name = oVar(''), errorTip = oVar('');

        showPopupWindow({
            title: '安装新的类库',
            content: <InputPackageName name={name} errorTip={errorTip} installedList={this._installedList} />,
            ok: {
                callback: async () => {
                    if (name.value) {
                        if (errorTip.value)
                            showMessageBox({ icon: 'error', title: errorTip.value });
                        else {
                            try {
                                this._processingList.push('_library_title_header_');
                                await ServerApi.library.installLibrary(name.value.trim());
                                this._refreshList();
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: `安装新的类库 ${name} 失败`, content: error.message });
                            } finally {
                                this._processingList.delete('_library_title_header_');
                            }
                        }
                    }
                }
            }
        });
    };

    //更新类库
    private readonly _updatePackage = (name: string, showPrompt: boolean = true) => {
        if (this._processingList.includes(name))
            showMessageBox({ icon: 'warning', title: `${name} 类库正常操作中，请稍后再试` });
        else {
            const task = async () => {
                try {
                    this._processingList.push(name);
                    await ServerApi.library.updateLibrary(name);
                    this._refreshList();
                } catch (error) {
                    showMessageBox({ icon: 'warning', title: `更新 ${name} 类库失败`, content: error.message });
                } finally {
                    this._processingList.delete(name);
                }
            };

            if (showPrompt) {
                showPopupWindow({
                    title: '更新类库',
                    content: <span>确定要更新 {name} 类库吗?</span>,
                    ok: { callback: task }
                });
            } else
                task();
        }
    };

    //删除类库
    private readonly _deletePackage = (name: string, showPrompt: boolean = true) => {
        if (this._processingList.includes(name))
            showMessageBox({ icon: 'warning', title: `${name} 类库正常操作中，请稍后再试` });
        else {
            const task = async () => {
                try {
                    this._processingList.push(name);
                    await ServerApi.library.uninstallLibrary(name);
                    this._installedList.splice(this._installedList.findIndex(item => item.name === name), 1);
                    this._refreshList();
                } catch (error) {
                    showMessageBox({ icon: 'warning', title: `删除 ${name} 类库失败`, content: error.message });
                } finally {
                    this._processingList.delete(name);
                }
            };

            if (showPrompt) {
                showPopupWindow({
                    title: '删除类库',
                    content: <span>确定要删除 {name} 类库吗?</span>,
                    ok: { callback: task }
                });
            } else
                task();
        }
    };

    //更新所有类库
    private readonly _updateAllPackage = () => {
        showPopupWindow({
            title: '更新或重新安装所有类库',
            content: <span>确定要更新或重新安装所有类库吗?</span>,
            ok: {
                callback: () => {
                    //排除正在操作中的类库
                    const list = this._installedList.filter(item => !this._processingList.includes(item.name));
                    list.forEach(item => this._updatePackage(item.name, false));
                }
            }
        });
    };

    //刷新类库列表
    private readonly _refreshList = debounce(async () => {
        try {
            this._processingList.push('_library_title_header_');
            this._installedList.value = await ServerApi.library.getInstalledLibraries();
        } catch (error) {
            showMessageBox({ icon: 'error', title: '刷新类库列表失败', content: error.message });
        } finally {
            this._processingList.delete('_library_title_header_');
        }
    }, 2000, { leading: true });

    protected _groupName = '类库管理';

    protected _subGroup = [
        {
            name: '已安装的类库列表',
            items: [
                (
                    <Container className={less.Library} darkBack>
                        <div className={classnames(less.row, less.titleBar)}>
                            <div className={less.processing}>
                                <ObservableComponentWrapper watch={[this._processingList]}
                                    render={() => this._processingList.includes('_library_title_header_') && <i />} />
                            </div>
                            <div className={less.packageName}>类库名称</div>
                            <div className={less.packageVersion}>版本号</div>
                            <div className={less.functionButton}>
                                <img title="安装新的类库" src="/static/res/img/buttons_icon/add_inverse.svg" onClick={this._installNewPackage} />
                                <img title="更新或重新安装所有类库" src="/static/res/img/buttons_icon/upgrade.svg" onClick={this._updateAllPackage} />
                                <img title="刷新类库列表" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshList} />
                            </div>
                        </div>
                        <ScrollBar className={less.ScrollBar}>
                            <ObservableComponentWrapper watch={[this._installedList]} render={() => this._installedList.map(item => (
                                <div key={item.name} className={less.row}>
                                    <div className={less.processing}>
                                        <ObservableComponentWrapper watch={[this._processingList]} render={() => this._processingList.includes(item.name) && <i />} />
                                    </div>
                                    <div className={less.packageName}>{item.name}</div>
                                    <div className={less.packageVersion}>{item.version}</div>
                                    <div className={less.functionButton}>
                                        <img title="更新类库" src="/static/res/img/buttons_icon/upgrade.svg" onClick={() => this._updatePackage(item.name)} />
                                        <img title="删除类库" src="/static/res/img/buttons_icon/deletion-inverse.svg" onClick={() => this._deletePackage(item.name)} />
                                    </div>
                                </div>
                            ))} />
                        </ScrollBar>
                    </Container>
                )
            ]
        }
    ];

    componentDidMount() {
        this._refreshList();
    }
}