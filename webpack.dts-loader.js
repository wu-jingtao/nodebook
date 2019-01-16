const fs = require('fs');
const util = require('util');
const path = require('path');
const glob = util.promisify(require("glob"));
const loaderUtils = require('loader-utils');
const strip = require('strip-comment');

/**
 * 加载指定目录下的所有dts文件，以 `[['相对于path的文件路径','文件文本内容']]` 的形式输出。
 * 使用时需使用path参数的形式传入路径（path是相对于项目的根目录），之后随便传入一个文件路径（webpack要求必须传入一个，并且最好不要是json、js等格式的文件）
 * 例子：require('!dts-loader?path=./node_modules/@types/jquery!./LICENSE')
 */
module.exports = function dtsLoader() {
    this.cacheable && this.cacheable();
    const callback = this.async();
    const options = loaderUtils.getOptions(this) || {};
    const dir = path.resolve(__dirname, options.path);

    (async () => {
        await fs.promises.access(dir); //确保文件夹路径可以访问
        const result = [];

        for (const item of await glob('**/*.d.ts', { cwd: dir })) {
            const filePath = path.resolve(dir, item);
            const content = await fs.promises.readFile(filePath, 'utf8');
            result.push([item, strip.js(content)]); //strip.js 去掉要打包的.d.ts文件中的注释
            this.addDependency(filePath);   //webpack标记缓存
        }

        return `module.exports = ${JSON.stringify(result).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}`;
    })().then(result => callback(null, result)).catch(callback);
}