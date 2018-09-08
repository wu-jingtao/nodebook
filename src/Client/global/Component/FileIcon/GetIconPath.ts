import { FileFormat } from './vscode-icons/models/extensions/fileFormat';
import * as supportedFolders from './vscode-icons/icon-manifest/supportedFolders';
import * as supportedExtensions from './vscode-icons/icon-manifest/supportedExtensions';

//#region 初始化扩展名列表

interface FileExtensionsType {
    /**
     * 图标的完整文件名称
     */
    icon: string,
    /**
     * 可匹配的扩展名
     */
    extensions: string[],
    /**
     * 是否匹配整个文件名
     */
    fileName: boolean
}

interface FolderExtensionsType {
    /**
     * 图标的完整文件名称
     */
    icon: (isOpened?: boolean) => string,
    /**
     * 可匹配的扩展名
     */
    extensions: string[]
}

const fileExtensions: FileExtensionsType[] = supportedExtensions.extensions.supported
    //排除vscode-icons禁用的，继承的，重载的
    .filter(item => item.disabled != true && item.extends == null && item.overrides == null)
    .map(item => {
        const result: FileExtensionsType = {
            icon: `file_type_${item.icon}.${typeof item.format === 'string' ? item.format : FileFormat[item.format]}`,
            extensions: [],
            fileName: item.filename == true
        };

        if (item.extensions.length > 0)
            result.extensions = item.extensions;

        if (item.extensionsGlob && item.filenamesGlob) {
            item.filenamesGlob.forEach(name => {
                (item.extensionsGlob as any[]).forEach(ext => {
                    result.extensions.push(`${name}.${ext}`);
                });
            });
        }

        if (item.languages)
            result.extensions = item.languages.map(item => item.defaultExtension);

        return result;
    });

const defaultFileExtensions: FileExtensionsType = {
    icon: `default_${(supportedExtensions.extensions.default.file as any).icon
        }.${typeof (supportedExtensions.extensions.default.file as any).format === 'string' ?
            (supportedExtensions.extensions.default.file as any).format :
            FileFormat[(supportedExtensions.extensions.default.file as any).format]}`,
    extensions: [],
    fileName: false
};

const folderExtensions: FolderExtensionsType[] = supportedFolders.extensions.supported
    //排除vscode-icons禁用的，继承的，重载的
    .filter(item => item.disabled != true && item.extends == null && item.overrides == null)
    .map(item => {
        const result: FolderExtensionsType = {
            icon: isOpened => `folder_type_${item.icon}${isOpened ? '_opened' : ''}.${typeof item.format === 'string' ? item.format : FileFormat[item.format]}`,
            extensions: item.extensions
        };

        return result;
    });

const defaultFolderExtensions: { folder: FolderExtensionsType, root_folder: FolderExtensionsType } = {
    folder: {
        icon: isOpened => `default_${(supportedFolders.extensions.default.folder as any).icon
            }${isOpened ? '_opened' : ''}.${typeof (supportedFolders.extensions.default.folder as any).format === 'string' ?
                (supportedFolders.extensions.default.folder as any).format :
                FileFormat[(supportedFolders.extensions.default.folder as any).format]}`,
        extensions: []
    },
    root_folder: {
        icon: isOpened => `default_${(supportedFolders.extensions.default.root_folder as any).icon
            }${isOpened ? '_opened' : ''}.${typeof (supportedFolders.extensions.default.root_folder as any).format === 'string' ?
                (supportedFolders.extensions.default.root_folder as any).format :
                FileFormat[(supportedFolders.extensions.default.root_folder as any).format]}`,
        extensions: []
    }
};

//#endregion

/**
 * 获取文件图标的路径
 * @param filename 文件名
 * @param isFolder 是不是文件夹
 * @param isOpened 文件夹是否被打开了
 * @param isRootFolder 是否是根文件夹
 */
export function getIconPath(filename: string, isFolder: boolean, isOpened?: boolean, isRootFolder?: boolean): string {
    filename = filename.trim().toLowerCase();

    if (isFolder) {
        var folder_ext: FolderExtensionsType;

        if (isRootFolder)
            folder_ext = defaultFolderExtensions.root_folder;
        else
            folder_ext = folderExtensions.find(item => item.extensions.includes(filename)) || defaultFolderExtensions.folder;

        return folder_ext.icon(isOpened);
    } else {
        const file_ext: FileExtensionsType = fileExtensions.find(item => {
            if (item.fileName)
                return item.extensions.includes(filename);
            else
                return item.extensions.some(item => filename.endsWith(item));
        }) || defaultFileExtensions;

        return file_ext.icon;
    }
}