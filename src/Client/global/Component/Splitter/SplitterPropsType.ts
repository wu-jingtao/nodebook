export interface SplitterPropsType {
    /**
     * 分隔条相对于屏幕的位置
     */
    onChange: (position: number) => void;

    /**
     * 设置为垂直方向分隔条，默认水平
     */
    vertical?: boolean;

    className?: string;
    style?: React.CSSProperties;
}