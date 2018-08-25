import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';

const styles = require('./TextInput.less');

interface Args {

    /**
     * 输入值
     */
    value: ObservableVariable<string>;

    type: 'text' | 'password';
    placeholder?: string;
    className?: any;
    style?: any;
    maxLength?: number;
}

/**
 * 容器。带有圆角矩形带边框的div
 */
export const TextInput: React.StatelessComponent<Args> = ({ maxLength, type, value, placeholder, className, style }) => {
    return (
        <input type={type}
            maxLength={maxLength}
            style={style}
            className={classnames(styles.input, className)}
            value={value.value}
            onChange={e => value.value = e.target.value}
            placeholder={placeholder} />
    );
};