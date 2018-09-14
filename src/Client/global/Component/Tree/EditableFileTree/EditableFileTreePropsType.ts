export interface EditableFileTreePropsType {

    /**
     * 禁用复制和剪切
     */
    noCopyCut?: boolean;

    /**
     * 禁用粘贴
     */
    noPaste?: boolean;

    /**
     * 禁用创建文件和文件夹
     */
    noCreate?: boolean;

    /**
     * 禁止删除
     */
    noDelete?: boolean;

    /**
     * 禁止重命名
     */
    noRename?: boolean;

    /**
     * 禁止上传
     */
    noUpload?: boolean;

    /**
     * 禁止下载
     */
    noDownload?: boolean;

    /**
     * 禁止压缩和解压
     */
    noZip?: boolean;

    /**
     * 是否记忆打开过的文件夹
     */
    memorable?: string;
}