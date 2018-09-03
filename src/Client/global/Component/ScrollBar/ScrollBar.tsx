import * as React from 'react';
import * as classnames from 'classnames';

const less = require('./ScrollBar.less');

/**
 * 滚动条。只有垂直滚动条
 */
export const ScrollBar = React.forwardRef<HTMLDivElement, { style?: any, className?: string }>((props, ref) => (
    <div className={classnames(less.ScrollBar, props.className)} style={props.style} ref={ref}>
        {props.children}
    </div>
));
