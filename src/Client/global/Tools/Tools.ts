/**
 * 断言
 */
export function expect(expect: any, tobe: any, exceptionMessage: string) {
    if (expect !== tobe) throw new Error(exceptionMessage);
}

/**
 * 防反跳
 * @param func 方法
 * @param interval 时间间隔
 */
export function debounce<T extends (...args: any[]) => any>(func: T, interval: number): T {
    let nextTime = 0;   //下次触发的时间
    let timer: any;     //计时器

    return ((...args: any[]) => {
        const now = Date.now();
        clearTimeout(timer);
        timer = setTimeout(() => {
            nextTime = now + interval;
            func(...args);
        }, Math.max(nextTime - now, 0));
    }) as any;
}