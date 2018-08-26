import * as React from 'react';
import * as classnames from 'classnames';

const less = require('./Button.less');

interface Args {
    /**
     * 是否显示加载动画
     */
    loading?: boolean;

    className?: any;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

/**
 * 按钮
 */
export const Button: React.StatelessComponent<Args> = ({ loading, className, onClick, disabled, children }) => {
    return (
        <button className={classnames(less.button, { loading: loading }, className)} onClick={onClick} disabled={disabled}>
            {!loading && children}
        </button>
    );
};