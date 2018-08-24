import { InitializeDatabase } from '../module/Database/InitializeDatabase';

/**
 * 清空IP过滤规则
 */

(async () => {
    const iniDB = new InitializeDatabase();
    await iniDB.onStart();

    await iniDB.dbCon.run(`
        UPDATE "main"."system_setting"
        SET "value" = ?
        WHERE "key" IN (?, ?) AND "secret" = 1
    `, null, 'http.ipWhiteListRegexp', 'http.ipBlackListRegexp');

    await iniDB.onStop();

    console.log('清空IP过滤规则成功，重启容器后生效。');
})();