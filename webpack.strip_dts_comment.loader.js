const strip = require('strip-comment');

/**
 * 去掉要打包的.d.ts文件中的注释
 */
module.exports = function (source) {
    return strip.js(source);
};