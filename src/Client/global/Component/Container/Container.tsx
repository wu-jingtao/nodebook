import * as React from 'react';
import * as classnames from 'classnames';

const less = require('./Container.less');

interface Args {

    /**
     * 不带边框
     */
    noBorder?: boolean;

    /**
     * 深色背景
     */
    darkBack?: boolean;

    className?: any;
}

/**
 * 容器。带有圆角矩形带边框的div
 */
export const Container: React.StatelessComponent<Args> = ({ noBorder, darkBack, className, children }) => {
    return (
        <div className={classnames(less.Container, { [less.border]: !noBorder, [less.darkBack]: darkBack }, className)}>
            {children}
        </div>
    );
};