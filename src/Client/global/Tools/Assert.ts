/**
 * 断言
 */
export function expect(expect: any, tobe: any, exceptionMessage: string) {
    if (expect !== tobe) throw new Error(exceptionMessage);
}