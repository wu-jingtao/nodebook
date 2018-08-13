import * as path from 'path';
import * as fs from 'fs-extra';
import * as koa from 'koa';
import log from 'log-formatter';
import { ObservableVariable } from 'observable-variable';

import { SystemSetting } from '../../SystemSetting/SystemSetting';

//配置系统设置变量
SystemSetting.addDynamicSetting('dynamic.favicon', undefined);

const _faviconPath = path.resolve(__dirname, 'favicon.ico');    //网站图标路径
let _hasFavicon = false;                                        //是否设置的有网站图标

//检测是否存在网站图标
async function _checkFavicon(): Promise<void> {
    try {
        await fs.promises.access(_faviconPath);
        _hasFavicon = true;
    } catch {
        _hasFavicon = false;
    }
}

/**
 * 网站图标
 */
export function Favicon(systemSetting: SystemSetting): koa.Middleware {
    _checkFavicon();

    const _favicon = systemSetting.normalSettings.get('dynamic.favicon') as ObservableVariable<string | undefined>;
    _favicon.on('set', async (filePath) => {
        try {
            if (filePath !== undefined) {
                await fs.move(filePath, _faviconPath, { overwrite: true });
                await _checkFavicon();
            } else {
                await fs.remove(_faviconPath);
                await _checkFavicon();
            }
        } catch (err) {
            log.error.location.text.content(Favicon.name, '替换或删除网站图标时发生异常：', err);
        }
    });

    return async function Favicon(ctx, next) {
        if (_hasFavicon && '/favicon.ico' === ctx.originalUrl) {
            ctx.body = fs.createReadStream(_faviconPath);
        } else {
            return next();
        }
    }
}
