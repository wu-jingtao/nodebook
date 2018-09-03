import * as React from 'react';
import * as classnames from 'classnames';

const less = require('./ScrollBar.less');

/**
 * 滚动条。只有垂直滚动条
 */
export const ScrollBar: React.StatelessComponent<{ style?: any, className?: string }> = (props) => {
    return (
        <div className={classnames(less.ScrollBar, props.className)} style={props.style}>
            {props.children}
        </div>
    );
};