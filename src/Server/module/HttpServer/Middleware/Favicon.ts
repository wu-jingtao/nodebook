import * as path from 'path';
import * as fs from 'fs-extra';
import * as koa from 'koa';

//网站图标路径
const _faviconPath = path.resolve(__dirname, 'favicon.ico');

//是否设置的有网站图标
let _hasFavicon = false;

/**
 * 网站图标
 */
export function Favicon(): koa.Middleware {
    _checkFavicon();

    return async function Favicon(ctx, next) {
        if (_hasFavicon && '/favicon.ico' === ctx.originalUrl) {
            ctx.body = fs.createReadStream(_faviconPath);
        } else {
            return next();
        }
    }
}

/**
 * 设置Favicon
 * @param filePath 用户上传的图标文件路径，如果为空则表示清除图标
 */
export async function setFavicon(filePath?: string): Promise<void> {
    if (filePath !== undefined) {
        await fs.move(filePath, _faviconPath, { overwrite: true });
        await _checkFavicon();
    } else {
        await fs.remove(_faviconPath);
        await _checkFavicon();
    }
}

//检测是否存在网站图标
async function _checkFavicon(): Promise<void> {
    try {
        await fs.promises.access(_faviconPath);
        _hasFavicon = true;
    } catch {
        _hasFavicon = false;
    }
}
