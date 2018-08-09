import { ObservableVariable, oVar } from 'observable-variable';
import { BaseServiceModule } from "service-starter";
import log from 'log-formatter';

import { SystemSettingTable } from "../Database/SystemSettingTable";

/**
 * 保存系统全局变量
 */
export class SystemSetting extends BaseServiceModule {

    //系统设置
    readonly settings: ReadonlyMap<string, ObservableVariable<any>> = new Map();

    async onStart(): Promise<void> {
        const settingTable = this.services.SystemSettingTable as SystemSettingTable;

        //读取数据库中的设置
        const data = await settingTable.getAllNormalKey();

        //配置可观察键
        for (const item of data) {
            const variable = oVar(item.value);
            variable.on("set", newValue => settingTable.updateNormalKey(item.key, newValue).catch(err => log.error.location.content(this.name, err)));

            (this.settings as Map<string, ObservableVariable<any>>).set(item.key, variable);
        }
    }
}