import { ObservableVariable, oVar } from "observable-variable";

import { ServerApi } from './ServerApi';
import { showMessageBox } from "../module/MessageBox/MessageBox";
import { throttle } from './Tools/Tools';

/**
 * 系统设置
 */
export const normalSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();
export const secretSettings: ReadonlyMap<string, ObservableVariable<any>> = new Map();

/**
 * 加载系统设置
 */
export async function loadSystemSetting(): Promise<void> {
    const _normalSettings = normalSettings as Map<string, ObservableVariable<any>>;
    const _secretSettings = secretSettings as Map<string, ObservableVariable<any>>;

    //清楚旧的设置
    _normalSettings.clear();
    _secretSettings.clear();

    const [normal, secret] = await Promise.all([ServerApi.settings.getAllNormalKey(), ServerApi.settings.getAllSecretKey()]);

    //普通设置可以直接修改
    normal.forEach(item => {
        const _value = oVar(item.value);
        _value.on('set', throttle(async (newValue, oldValue) => {
            try {
                await ServerApi.settings.changeNormalSetting(item.key, newValue);
            } catch (error) {
                showMessageBox({ icon: 'error', title: `修改普通设置'${item.key}'失败`, content: error.message });
                _value.value = oldValue;
            }
        }, 5 * 1000));
        _normalSettings.set(item.key, _value);
    });

    secret.forEach(item => {
        _secretSettings.set(item.key, oVar(item.value, { readonly: true }));
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


