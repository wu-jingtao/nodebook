import { ObservableVariable, oVar } from 'observable-variable';
import { BaseServiceModule } from "service-starter";
import log from 'log-formatter';

import { SystemSettingTable } from "../Database/SystemSettingTable";

/**
 * 保存系统全局变量
 */
export class SystemSetting extends BaseServiceModule {

    //#region 静态

    /**
     * 系统设置默认值。顺序："key", "value", "secret", "type"
     */
    private static readonly _defaultSystemSettingValue: Map<string, [any, boolean, string]> = new Map();

    /**
     * 过期的系统设置。
     */
    private static readonly _expiredSystemSetting: string[] = [];

    /**
     * 添加系统设置项
     */
    static addSystemSetting(key: string, value: string, secret: boolean, type: 'string'): void;
    static addSystemSetting(key: string, value: boolean, secret: boolean, type: 'boolean'): void;
    static addSystemSetting(key: string, value: number, secret: boolean, type: 'number'): void
    static addSystemSetting(key: string, value: any, secret: boolean, type: string): void {
        SystemSetting._defaultSystemSettingValue.set(key, [value, secret, type]);
    }

    /**
     * 使某个系统变量过期。这个主要是用在版本更新的时候，当某个设置在新版中不存在的时候就需要调用这个方法，将过期的设置删除
     */
    static expireSystemSetting(key: string): void {
        SystemSetting._expiredSystemSetting.push(key);
    }

    //#endregion

    //#region 私有

    private _systemSettingTable: SystemSettingTable;
    private _userPassword: ObservableVariable<string>;

    async onStart(): Promise<void> {
        this._systemSettingTable = this.services.SystemSettingTable;

        await this._initializeDefaultValue();
        await this._deleteExpiredSetting();
        await this._readSystemSettingValue();

        this._userPassword = this.secretSettings.get('user.password') as any;
    }

    /**
     * 转换数据类型
     */
    private _transformType(key: string, value: any): any {
        const definition = SystemSetting._defaultSystemSettingValue.get(key);
        if (definition) {
            switch (definition[2]) {
                case 'string':
                    return value;

                case 'boolean':
                    return value == '1' || value == 'true';

                case 'number':
                    return +value;

                default:
                    throw new Error('未知变量类型：' + definition[2]);
            }
        } else
            throw new Error('系统设置项不存在或已过期：' + key);
    }

    /**
     * 读取数据库中的设置
     */
    private async _readSystemSettingValue(): Promise<void> {
        //普通键
        for (const item of await this._systemSettingTable.getAllNormalKey()) {
            const variable = oVar(this._transformType(item.key, item.value));
            variable.on("set", newValue => this._systemSettingTable.updateNormalKey(item.key, newValue).catch(err => log.error.location.content(this.name, err)));

            (this.normalSettings as Map<string, ObservableVariable<any>>).set(item.key, variable);
        }

        //私密键
        for (const item of await this._systemSettingTable.getAllSecretKey()) {
            const variable = oVar(this._transformType(item.key, item.value));
            variable.on("set", newValue => this._systemSettingTable.updateSecretKey(item.key, newValue).catch(err => log.error.location.content(this.name, err)));

            (this.secretSettings as Map<string, ObservableVariable<any>>).set(item.key, variable);
        }
    }

    /**
     * 初始化系统表的中的默认值
     */
    private async _initializeDefaultValue(): Promise<void> {
        for (const [key, [value, secret]] of SystemSetting._defaultSystemSettingValue.entries()) {
            await this._systemSettingTable.addNewKey(key, value, secret).catch(() => { });
        }
    }

    /**
     * 从数据库中删除过期设置项
     */
    private async _deleteExpiredSetting(): Promise<void> {
        for (const key of SystemSetting._expiredSystemSetting) {
            await this._systemSettingTable.removeExpiredKey(key);
        }
    }

    //#endregion

    /**
     * 普通系统设置
     */
    readonly normalSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();

    /**
     * 私密系统设置
     */
    readonly secretSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();

    /**
     * 改变普通设置
     */
    changeNormalSetting(key: string, value: any): void {
        const ov = this.normalSettings.get(key);
        if (ov)
            ov.value = this._transformType(key, value);
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
                ov.value = this._transformType(key, value);
            else
                throw new Error('用户密码错误');
        } else
            throw new Error(`私密设置项 '${key}' 不存在`);
    }

    /**
     * 获取所有普通设置的键值对
     */
    getAllNormalKey(): ReadonlyArray<{ key: string, value: any }> {
        return [...this.normalSettings.entries()].map(([key, value]) => ({ key, value: value.value }));
    }

    /**
     * 获取所有私密设置的键值对。除了密码
     */
    getAllSecretKey(): ReadonlyArray<{ key: string, value: any }> {
        const data = [...this.secretSettings.entries()].map(([key, value]) => ({ key, value: value.value }));
        return data.filter(item => item.key !== 'user.password' && item.key !== 'mail.pass');
    }
}