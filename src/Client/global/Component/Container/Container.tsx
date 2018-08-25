import * as React from 'react';
import * as classnames from 'classnames';

const styles = require('./Container.less');

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
    style?: any;
}

/**
 * 容器。带有圆角矩形带边框的div
 */
export const Container: React.StatelessComponent<Args> = ({ noBorder, darkBack, className, style, children }) => {
    return (
        <div style={style} className={classnames(styles.Container, { [styles.border]: !noBorder, [styles.darkBack]: darkBack }, className)}>
            {children}
        </div>
    );
};