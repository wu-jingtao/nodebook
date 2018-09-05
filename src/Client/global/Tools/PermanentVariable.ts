import { ObservableVariable, oVar, ObservableArray, oArr, watch, ObservableSet, oSet } from "observable-variable";

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
 * 自动将数据读取和保存到localStorage的oArr
 * @param name localStorage 中的键名
 * @param defaultValue 默认值的JSON字符串
 * @param observeProps 如果数组中存放的是一个个对象，需要确保当对象中某一个属性的值发生改变时也将数据保存到localStorage
 */
export function permanent_oArr(name: string, defaultValue: string = '[]', observeProps: [{ key: string, type: typeof ObservableVariable }] = [] as any): ObservableArray<any> {
    const _value = oArr(JSON.parse(localStorage.getItem(name) || defaultValue));
    const _saveChange = throttle(() => localStorage.setItem(name, JSON.stringify(_value)), 1000);
    const _watchProp = (item: any) => {
        observeProps.forEach(({ key, type }) => {
            type.observe(item, key);
            watch([key.split('.').reduce((pre: any, key) => pre[key], item)], _saveChange);
        });
    };
    _value.forEach(_watchProp);
    _value.on('add', _watchProp);
    watch([_value], _saveChange);
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