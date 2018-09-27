import { watch, ObservableVariable, ObservableArray, ObservableSet, ObservableMap, oVar, oArr, oSet, oMap } from "observable-variable";

import { throttle } from "./Tools";

/**
 * 保存变量的到期时间
 * key是变量名称
 * value是到期的时间戳
 */
const expireList: ObservableMap<string, number> = permanent_oMap('ui.PermanentVariable.expireList');

//每隔10分钟检查一次过期
setInterval(() => {
    const expired = [], now = Date.now();

    for (const [key, value] of expireList.entries())
        if (value < now) expired.push(key);

    for (const item of expired) {
        localStorage.removeItem(item);
        expireList.delete(item);
    }
}, 1000 * 60 * 10);

/**
 * 自动将数据读取和保存到localStorage的oVar
 * @param name localStorage 中的键名
 * @param defaultValue 默认值的JSON字符串
 * @param expire 多少秒后到期
 */
export function permanent_oVar(name: string, defaultValue: string = 'null', expire?: number): ObservableVariable<any> {
    const _value = oVar(JSON.parse(localStorage.getItem(name) || defaultValue));
    watch([_value], throttle(() => localStorage.setItem(name, JSON.stringify(_value)), 1000));
    if (expire) expireList.set(name, Date.now() + expire * 1000);
    return _value;
}

/**
 * 自动将数据读取和保存到localStorage的oArr
 * @param name localStorage 中的键名
 * @param defaultValue 默认值的JSON字符串
 * @param expire 多少秒后到期
 */
export function permanent_oArr(name: string, defaultValue: string = '[]', expire?: number): ObservableArray<any> {
    const _value = oArr(JSON.parse(localStorage.getItem(name) || defaultValue));
    watch([_value], throttle(() => localStorage.setItem(name, JSON.stringify(_value)), 1000));
    if (expire) expireList.set(name, Date.now() + expire * 1000);
    return _value;
}

/**
 * 自动将数据读取和保存到localStorage的oSet
 * @param name localStorage 中的键名
 * @param defaultValue 默认值的JSON字符串
 * @param expire 多少秒后到期
 */
export function permanent_oSet(name: string, defaultValue: string = '[]', expire?: number): ObservableSet<any> {
    const _value = oSet(JSON.parse(localStorage.getItem(name) || defaultValue));
    watch([_value], throttle(() => localStorage.setItem(name, JSON.stringify(_value)), 1000));
    if (expire) expireList.set(name, Date.now() + expire * 1000);
    return _value;
}

/**
 * 自动将数据读取和保存到localStorage的oMap
 * @param name localStorage 中的键名
 * @param defaultValue 默认值的JSON字符串
 * @param expire 多少秒后到期
 */
export function permanent_oMap(name: string, defaultValue: string = '[]', expire?: number): ObservableMap<any, any> {
    const _value = oMap(JSON.parse(localStorage.getItem(name) || defaultValue));
    watch([_value], throttle(() => localStorage.setItem(name, JSON.stringify(_value)), 1000));
    if (expire) expireList.set(name, Date.now() + expire * 1000);
    return _value;
}