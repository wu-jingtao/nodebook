import { ObservableVariable, oVar, watch, ObservableSet, oSet } from "observable-variable";

import { throttle } from "./Tools";

/**
 * 自动将数据读取和保存到localStorage的oVar
 * @param name localStorage 中的键名
 * @param defaultValue 默认值的JSON字符串
 */
export function permanent_oVar(name: string, defaultValue: string = 'null'): ObservableVariable<any> {
    const _value = oVar(JSON.parse(localStorage.getItem(name) || defaultValue));
    _value.on('set', throttle(() => localStorage.setItem(name, JSON.stringify(_value)), 1000));
    return _value;
}

/**
 * 自动将数据读取和保存到localStorage的oSet
 * @param name localStorage 中的键名
 * @param defaultValue 默认值的JSON字符串
 */
export function permanent_oSet(name: string, defaultValue: string = '[]'): ObservableSet<any> {
    const _value = oSet(JSON.parse(localStorage.getItem(name) || defaultValue));
    watch([_value], throttle(() => localStorage.setItem(name, JSON.stringify(_value)), 1000));
    return _value;
}