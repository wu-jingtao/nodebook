import { ObservableVariable } from "observable-variable";

/**
 * 窗口的类型
 */
export enum WindowType {
    'code_editor',      //monaco代码编辑器
    'mind_map',         //思维导图
    'html_viewer',      //html查看器
    'markdown_viewer',  //markdown查看器
    'image_viewer',     //图片查看器
    'pdf_viewer',       //PDF查看器
    'video_player',     //音频视频播放器
    'task',             //任务状态管理器
    'service',          //服务状态管理器
    'settings'          //系统设置
}

export interface WindowArgs {
    /**
     * 随机生成的唯一标识符
     */
    id: string;

    /**
     * 窗口的名称
     */
    name: string;

    /**
     * 窗口的类型
     */
    type: WindowType;

    /**
     * 窗口是否固定。默认最开始是未固定。如果用户打开新窗口时存在未固定的旧窗口，则会先关闭未固定的旧窗口，再打开新窗口。
     * 如果用户打开相同的窗口两次，则该窗口会自动变为固定窗口。
     */
    fixed: ObservableVariable<boolean>;

    /**
     * 额外的参数供打开的窗口使用。注意，参数应当是可序列化的
     */
    args: { [key: string]: any };
}

export interface FileWindowArgs extends WindowArgs {
    args: {
        /**
         * 文件的绝对路径
         */
        path: string
    }
}

export interface CodeEditorWindowArgs extends FileWindowArgs {
    type: WindowType.code_editor;

    args: {
        /**
         * 文件的绝对路径
         */
        path: string,
        /**
         * 是否是只读
         */
        readonly?: boolean,
        /**
         * 是否以代码对比方式打开
         */
        diff?: boolean,
    }
}

export interface MindMapWindowArgs extends FileWindowArgs {
    type: WindowType.mind_map;

    args: {
        /**
         * 文件的绝对路径
         */
        path: string,
        /**
         * 是否是只读
         */
        readonly?: boolean
    }
}

export interface HtmlViewerWindowArgs extends FileWindowArgs {
    type: WindowType.html_viewer;
}

export interface MarkdownViewerWindowArgs extends FileWindowArgs {
    type: WindowType.markdown_viewer;

    args: {
        /**
         * 文件的绝对路径
         */
        path: string,
        /**
         * 是否是只读
         */
        readonly?: boolean
    }
}

export interface PDFViewerWindowArgs extends FileWindowArgs {
    type: WindowType.pdf_viewer;
}

export interface ImageViewerWindowArgs extends FileWindowArgs {
    type: WindowType.image_viewer;
}

export interface VideoPlayerWindowArgs extends FileWindowArgs {
    type: WindowType.video_player;
}

export interface TaskWindowArgs extends FileWindowArgs {
    type: WindowType.task;
}

export interface ServiceWindowArgs extends FileWindowArgs {
    type: WindowType.service;
}

export interface SettingsWindowArgs extends WindowArgs {
    type: WindowType.settings;
}