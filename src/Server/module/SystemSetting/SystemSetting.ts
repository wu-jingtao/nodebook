import { ObservableVariable, oVar } from 'observable-variable';
import { BaseServiceModule } from "service-starter";
import log from 'log-formatter';

import { SystemSettingTable } from "../Database/SystemSettingTable";

/**
 * 保存系统全局变量
 */
export class SystemSetting extends BaseServiceModule {

    //系统设置默认值。顺序："key", "value", "is_server", "secret"
    private static readonly _defaultSystemSettingValue: Array<[string, any, boolean, boolean]> = [];

    /**
     * 添加系统设置项
     */
    static addSystemSetting(key: string, value: any, is_server: boolean, secret: boolean) {
        SystemSetting._defaultSystemSettingValue.push([key, value, is_server, secret]);
    }

    private _systemSettingTable: SystemSettingTable;
    private _userPassword: ObservableVariable<string>;

    /**
     * 普通系统设置
     */
    readonly normalSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();

    /**
     * 私密系统设置
     */
    readonly secretSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();

    /**
     * 读取数据库中的设置
     */
    private async _readSystemSettingValue(): Promise<void> {
        //普通键
        for (const item of await this._systemSettingTable.getAllNormalKey()) {
            const variable = oVar(item.value);
            variable.on("set", newValue => this._systemSettingTable.updateNormalKey(item.key, newValue).catch(err => log.error.location.content(this.name, err)));

            (this.normalSettings as Map<string, ObservableVariable<any>>).set(item.key, variable);
        }

        //私密键
        for (const item of await this._systemSettingTable.getAllSecretKey()) {
            const variable = oVar(item.value);
            variable.on("set", newValue => this._systemSettingTable.updateSecretKey(item.key, newValue).catch(err => log.error.location.content(this.name, err)));

            (this.secretSettings as Map<string, ObservableVariable<any>>).set(item.key, variable);
        }
    }

    /**
     * 初始化系统表的中的默认值
     */
    private async _initializeDefaultValue(): Promise<void> {
        for (const [key, value, is_server, secret] of SystemSetting._defaultSystemSettingValue) {
            await this._systemSettingTable.addNewKey(key, value, is_server, secret).catch(() => { });
        }
    }

    async onStart(): Promise<void> {
        this._systemSettingTable = this.services.SystemSettingTable;

        await this._initializeDefaultValue();
        await this._readSystemSettingValue();

        this._userPassword = this.secretSettings.get('user.password') as any;
    }

    /**
     * 改变普通设置
     */
    changeNormalSetting(key: string, value: any): void {
        const ov = this.normalSettings.get(key);
        if (ov)
            ov.value = value;
        else
            throw new Error(`普通设置项 '${key}' 不存在`);
    }

    /**
     * 改变私密设置
     */
    changeSecretSetting(key: string, value: any, userPassword: string): void {
        const ov = this.secretSettings.get(key);
        if (ov) {
            if (this._userPassword.value === userPassword)
                ov.value = value;
            else
                throw new Error('用户密码错误');
        } else
            throw new Error(`私密设置项 '${key}' 不存在`);
    }
}