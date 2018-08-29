import * as _ from 'lodash';
import { ObservableVariable, oVar } from "observable-variable";

import { ServerApi } from './ServerApi';
import { showMessageBox } from "../module/MessageBox/MessageBox";

/**
 * 系统设置
 */
export const normalSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();
export const secretSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();

/**
 * 加载系统设置
 */
export async function loadSystemSetting(): Promise<void> {
    const [normal, secret] = await Promise.all([ServerApi.settings.getAllNormalKey(), ServerApi.settings.getAllSecretKey()]);

    //普通设置可以直接修改
    normal.forEach(item => {
        const obj = normalSettings.get(item.key);

        if (obj) {  //如果有了就只更新值
            obj.value = item.value;
        } else {
            const _value = oVar(item.value);
            _value.on('set', _.debounce(async (newValue, oldValue) => {
                try {
                    await ServerApi.settings.changeNormalSetting(item.key, newValue);
                } catch (error) {
                    showMessageBox({ icon: 'error', title: `修改普通设置'${item.key}'失败`, content: error.message });
                    _value.value = oldValue;
                }
            }, 5 * 1000));
            (normalSettings as any).set(item.key, _value);
        }
    });

    secret.forEach(item => {
        const obj = secretSettings.get(item.key);

        if (obj) {  //如果有了就只更新值
            obj.readonly = false;
            obj.value = item.value;
            obj.readonly = true;
        } else {
            const _value = oVar(item.value, { readonly: true });
            (secretSettings as any).set(item.key, _value);
        }
    });
}

/**
 * 改变私密键的值
 */
export async function changeSecretSetting(key: string, value: any, password: string): Promise<void> {
    const obj = secretSettings.get(key);
    if (obj) {
        try {
            await ServerApi.settings.changeSecretSetting(key, value, password);
            obj.readonly = false;
            obj.value = value;
            obj.readonly = true;
        } catch (error) {
            showMessageBox({ icon: 'error', title: `修改私密设置'${key}'失败`, content: error.message });
        }
    } else
        throw new Error(`要修改的私密设置项'${key}'不存在`);
}


