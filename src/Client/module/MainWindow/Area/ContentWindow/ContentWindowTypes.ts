import { ObservableVariable, ObservableArray } from "observable-variable";

/**
 * 窗口的类型
 */
export enum WindowType {
    'code_editor',      //monaco代码编辑器
    'markdown_editor',  //stackedit markdown代码编辑器
    'html_viewer',      //html 查看器
    'image_viewer',     //图片查看器
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
    args?: { [key: string]: any };
}

export interface CodeEditorWindowArgs extends WindowArgs {
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
         * 是否开启对比模式
         */
        diff?: boolean,
    }
}

export interface MarkdownEditorWindowArgs extends WindowArgs {
    type: WindowType.markdown_editor;
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
         * 是否以查看模式打开
         */
        viewMode?: boolean,
    }
}

export interface HtmlViewerWindowArgs extends WindowArgs {
    type: WindowType.html_viewer;
    args: {
        /**
         * 文件的绝对路径
         */
        path: string
    }
}

export interface ImageViewerWindowArgs extends WindowArgs {
    type: WindowType.image_viewer;
    args: {
        /**
         * 文件的绝对路径
         */
        path: string
    }
}

export interface VideoPlayerWindowArgs extends WindowArgs {
    type: WindowType.video_player;
    args: {
        /**
         * 文件的绝对路径
         */
        path: string
    }
}

export interface TaskWindowArgs extends WindowArgs {
    type: WindowType.task;
    args: {
        /**
         * 任务对应文件的绝对路径
         */
        path: string
    }
}

export interface ServiceWindowArgs extends WindowArgs {
    type: WindowType.service;
    args: {
        /**
         * 服务对应文件的绝对路径
         */
        path: string
    }
}

export interface SettingsWindowArgs extends WindowArgs {
    type: WindowType.settings;
}