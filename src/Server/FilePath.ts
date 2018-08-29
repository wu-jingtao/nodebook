/*
 * 程序中会用到的一些文件路径 
 */

/**
 * nodebook程序目录
 */
export const _appDir = '/app/';

/**
 * openssl证书目录
 */
export const _opensslKeyDir = '/key/';

/**
 * 用户数据存放目录
 */
export const _userDataDir = '/user_data/';

/**
 * 程序数据存放目录
 */
export const _programDataDir = '/program_data/';

/**
 * nodebook客户端程序文件目录
 */
export const _appClientFileDir = _appDir + 'bin/Client/';

/**
 *用户代码存放目录
 */
export const _userCodeDir = _userDataDir + 'code/';

/**
 * 用户安装的依赖库目录
 */
export const _libraryDir = _userDataDir + 'node_modules/'

/**
 * 回收站目录，暂存用户删除的代码
 */
export const _recycleDir = _userDataDir + 'recycle/';

/**
 * 数据库文件存放目录
 */
export const _databaseDir = _userDataDir + 'db/';

/**
 * 用户数据备份目录
 */
export const _userDataBackupDir = _userDataDir + 'backup/';

/**
 * 程序logo存放目录
 */
export const _logoDir = _userDataDir + 'logo/';

/**
 * openssl私钥路径
 */
export const _opensslPrivkeyPath = _opensslKeyDir + 'privkey.pem';

/**
 * openssl公钥路径
 */
export const _opensslCertPath = _opensslKeyDir + 'cert.pem';

/**
 * openssl私钥密码
 */
export const _opensslPasswordPath = _opensslKeyDir + 'password.txt';

/**
 * 数据库文件路径
 */
export const _databasePath = _databaseDir + 'nodebook_system_data.db';

/**
 * 程序商标路径
 */
export const _logoBrandPath = _logoDir + 'brand.png';

/**
 * 程序图标路径
 */
export const _logoIconPath = _logoDir + 'icon.png';

/**
 * 程序小图标路径
 */
export const _logoFaviconPath = _logoDir + 'favicon.ico';