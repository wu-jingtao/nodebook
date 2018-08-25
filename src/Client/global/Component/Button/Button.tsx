import * as React from 'react';
import * as classnames from 'classnames';

const styles = require('./Button.less');

interface Args {
    /**
     * 是否显示加载动画
     */
    loading?: boolean;

    className?: any;
    style?: any;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * 按钮
 */
export const Button: React.StatelessComponent<Args> = ({ onClick, loading, className, style, children }) => {
    return (
        <button className={classnames(styles.button, { loading: loading }, className)} style={style} onClick={onClick}>
            {!loading && children}
        </button>
    );
};