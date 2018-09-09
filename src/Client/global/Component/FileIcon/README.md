# 说明

所有的文件图标都来自于 [vscode-icons](https://github.com/vscode-icons/vscode-icons)

### 使用版本

*v7.25.0*

### 要复制的文件
* 将`icons`目录下的所有图标复制到 `/src/Client/res/img/file_icons` 下
* 复制`icon-manifest`目录下的`languages.ts`、`supportedExtensions.ts`、`supportedFolders.ts`
* 复制`models`目录下的`extensions`、`language`目录
* 复制`models`目录下的`index.ts`，将`index.ts`中多于的`export * from`删除

### 常见的文件图标冲突
* 将`languages.ts`下的`django`扩展名改为`django.html`