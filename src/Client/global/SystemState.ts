import { oVar } from 'observable-variable';

/**
 * 全局的系统状态
 */
export const SystemState = {
    /**
     * 是否已经登录
     */
    hasLoggedIn: oVar(false),
};