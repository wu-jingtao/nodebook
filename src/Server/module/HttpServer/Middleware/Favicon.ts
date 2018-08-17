import * as path from 'path';
import * as fs from 'fs-extra';
import * as koa from 'koa';
import * as Error from 'http-errors';

const _faviconPath = path.resolve(__dirname, 'favicon.ico');    //网站图标路径
let _hasFavicon = false;                                        //是否设置的有网站图标

/**
 * 检测是否存在网站图标
 */
async function _checkFavicon(): Promise<void> {
    try {
        await fs.promises.access(_faviconPath);
        _hasFavicon = true;
    } catch {
        _hasFavicon = false;
    }
}

/**
 * 设置网站图标，如果传入空则表示删除图标
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

/**
 * 网站图标
 */
export function Favicon(): koa.Middleware {
    _checkFavicon();

    return function Favicon(ctx) {
        if (_hasFavicon)
            ctx.body = fs.createReadStream(_faviconPath);
        else
            throw new Error.NotFound();
    }
}
