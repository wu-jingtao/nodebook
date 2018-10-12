//这里之所以单独来出来是因为RecyclePanel与UserCodePanel会产生循环引用

let _callback: (() => void) | undefined = undefined;

/**
 * 刷新回收站根目录
 */
export function refreshRecycle() {
    _callback && _callback();
}

export function _setRefreshRecycle(callback: (() => void) | undefined) {
    _callback = callback;
}