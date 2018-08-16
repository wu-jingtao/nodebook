import * as path from 'path';
import * as fs from 'fs-extra';
import * as koa from 'koa';
import * as koa_compose from 'koa-compose';
import * as Error from 'http-errors';
import log from 'log-formatter';
import { ObservableVariable } from 'observable-variable';
import koa_conditional = require('koa-conditional-get');
import koa_etag = require('koa-etag');

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
    
    return koa_compose([
        koa_conditional(),
        koa_etag(),
        function Favicon(ctx) {
            if (_hasFavicon)
                ctx.body = fs.createReadStream(_faviconPath);
            else
                throw new Error.NotFound();
        }
    ]);
}
