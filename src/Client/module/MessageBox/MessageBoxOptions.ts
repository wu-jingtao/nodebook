import { ObservableVariable } from "observable-variable";

/**
 * 消息提示框参数
 */
export interface MessageBoxOptions {

    /**
     * 图标
     */
    icon?: 'error' | 'message' | 'ok' | 'question' | 'recovery' | 'star' | 'warning' | 'write' | 'file' | 'attachment';

    /**
     * 标题
     */
    title: string;

    /**
     * 内容
     */
    content?: string;

    /**
     * 按钮
     */
    buttons?: { ok?: { name?: string, callback: () => void }, cancel?: { name?: string, callback: () => void } };

    /**
     * 显示进度条，0 - 100 。当到达100后，如果 autoClose > 0 则自动关闭消息框
     */
    progress?: ObservableVariable<number>

    /**
     * 是否自动关闭，如果没有设置 buttons 或 progress 则默认7秒后关闭。单位秒。设置为0则表示不关闭
     */
    autoClose?: number;
}