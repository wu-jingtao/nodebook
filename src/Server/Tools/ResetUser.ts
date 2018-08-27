import * as crypto from 'crypto';
import { InitializeDatabase } from '../module/Database/InitializeDatabase';

/**
 * 重置用户脚本。将用户名与密码更改为默认设置
 */

(async () => {
    const iniDB = new InitializeDatabase();
    await iniDB.onStart();

    await iniDB.dbCon.run(`
        UPDATE "main"."system_setting"
        SET "value" = ?
        WHERE "key" = ? AND "secret" = 1
    `, 'node@book.com', 'user.name');

    await iniDB.dbCon.run(`
        UPDATE "main"."system_setting"
        SET "value" = ?
        WHERE "key" = ? AND "secret" = 1
    `, crypto.createHash("md5").update('123456').digest('hex'), 'user.password');

    await iniDB.onStop();

    console.log('重置用户成功，重启容器后生效。用户名：node@book.com 密码：123456');
})();