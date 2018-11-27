import * as path from 'path';

/*
 * 程序中会用到的一些文件路径 
 */

/**
 * nodebook程序目录
 */
export const _appDir = '/app';

/**
 * openssl证书目录
 */
export const _opensslKeyDir = '/key';

/**
 * 用户数据存放目录
 */
export const _userDataDir = '/user_data';

/**
 * 程序数据存放目录
 */
export const _programDataDir = '/program_data';

/**
 * nodebook客户端程序文件目录
 */
export const _appClientFileDir = path.join(_appDir, './bin/Client');

/**
 *用户代码存放目录
 */
export const _userCodeDir = path.join(_userDataDir, './code');

/**
 * 用户安装的依赖库目录
 */
export const _libraryDir = path.join(_userDataDir, './node_modules')

/**
 * 回收站目录，暂存用户删除的代码
 */
export const _recycleDir = path.join(_userDataDir, './recycle');

/**
 * 数据库文件存放目录
 */
export const _databaseDir = path.join(_userDataDir, './db');

/**
 * 用户数据备份目录
 */
export const _userDataBackupDir = path.join(_userDataDir, './backup');

/**
 * 程序logo存放目录
 */
export const _logoDir = path.join(_userDataDir, './logo');

/**
 * openssl私钥路径
 */
export const _opensslPrivkeyPath = path.join(_opensslKeyDir, './privkey.pem');

/**
 * openssl公钥路径
 */
export const _opensslCertPath = path.join(_opensslKeyDir, './cert.pem');

/**
 * openssl私钥密码
 */
export const _opensslPasswordPath = path.join(_opensslKeyDir, './password.txt');

/**
 * 数据库文件路径
 */
export const _databasePath = path.join(_databaseDir, './nodebook_system_data.db');

/**
 * 用户安装类库 package.json
 */
export const packageJson = path.join(_userDataDir, './package.json');

/**
 * 程序商标路径
 */
export const _logoBrandPath = path.join(_logoDir, './brand.png');

/**
 * 程序图标路径
 */
export const _logoIconPath = path.join(_logoDir, './icon.png');

/**
 * 程序小图标路径
 */
export const _logoFaviconPath = path.join(_logoDir, './favicon.ico');