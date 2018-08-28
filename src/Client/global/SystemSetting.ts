import { ObservableVariable, oVar } from "observable-variable";
import { ServerApi } from './ServerApi';

/**
 * 系统设置
 */
export const NormalSettings = new Map<string, ObservableVariable<any>>();
export const SecretSettings = new Map<string, ObservableVariable<any>>();

/**
 * 加载系统设置
 */
export async function _loadSystemSetting(): Promise<void> {
    const [normal, secret] = await Promise.all([ServerApi.settings.getAllNormalKey(), ServerApi.settings.getAllSecretKey()]);
    normal.forEach(item => NormalSettings.set(item.key, oVar(item.value)));
    secret.forEach(item => SecretSettings.set(item.key, oVar(item.value)));
}