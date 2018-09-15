export interface PopupWindowConfig {

    /**
     * 标题栏
     */
    title: string;

    /**
     * 要显示的内容
     */
    content: JSX.Element;

    /**
     * 确认按钮，不设置则不显示
     */
    ok?: { name?: string, callback: () => void };

    /**
     * 取消按钮
     */
    cancel?: { name?: string, callback: () => void };
}