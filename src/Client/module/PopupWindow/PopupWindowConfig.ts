export interface PopupWindowConfig {
    /**
     * 要显示的内容
     */
    content: JSX.Element;

    /**
     * 确认按钮，不设置则不显示
     */
    ok?: () => void;

    /**
     * 取消按钮
     */
    cancel?: () => void;
}