# nodebook
![nodebook](./src/Client/res/img/logo/brand.png)

## 使用 NodeBook 时代码命名规范

* 所有服务器端代码全部以`*.server.js`命名
* 所有浏览器端代码全部以`*.client.js`命名
* 区别是工具模块还是服务入口文件等等，可以在结尾前多加一级前缀，例如：`*.tool.server.js`、`*.service.server.js`、`*.module.server.js`
* 思维导图文件以`.mindmap`结尾

## 默认用户名、密码
* username：`node@book.com`
* password：`123456`

## npm script 说明

* npm run compileServer 编译服务器端代码
* npm run compileClient 编译浏览器端代码
* npm run compileClientWatch 以 Webpack Watch 模式编译浏览器端代码
* npm run resetUser 重置数据库中的用户名与密码
* npm run cleanIPFilter 清空数据库中的IP访问限制
* npm run resumeFromBackup 从备份文件恢复用户数据。使用时需要传入备份文件的文件名(不是文件的绝对路径)

## 更新或添加浏览器端编辑器的代码提示依赖
[`src/Client/module/MainWindow/Area/ContentWindow/Windows/CodeEditorWindow/CodeEditorWindowContent.tsx`](../src/Client/module/MainWindow/Area/ContentWindow/Windows/CodeEditorWindow/CodeEditorWindowContent.tsx)

## 加密备份文件编码
在使用解压软件打开加密备份文件时可能会出现乱码，将解压软件的字符编码选择为`UTF8`即可

## Docker 环境变量
* `DOMAIN` 网站的域名
* `DEBUG`  是否开启调试模式
* `TZ`     时区，默认是上海

## Docker 挂载点
* `/user_data`      用户数据目录
* `/program_data`   程序数据目录
* `/key`            存放HTTPS证书的目录
    * `./privkey.pem`    openssl私钥密码
    * `./cert.pem`       openssl公钥路径
    * `./password.pem`   openssl私钥密码（没有可以忽略）

# 版本依赖提示
* "video-react": "0.13.2" 就使用这个版本，新版本用babel打包，大小会增大许多
* "monaco-editor": "0.16.0" 高于这个版本会与 "monaco-editor-webpack-plugin": "1.7.0" 出现兼容性问题