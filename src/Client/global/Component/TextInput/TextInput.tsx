import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';

const styles = require('./TextInput.less');

interface Args {

    /**
     * 输入值
     */
    value: ObservableVariable<string>;
    type: 'text' | 'password' | 'email';
    placeholder?: string;
    className?: any;
    style?: any;
    maxLength?: number;
    required?: boolean;
}

/**
 * 文本输入框
 */
export const TextInput: React.StatelessComponent<Args> = ({ required, maxLength, type, value, placeholder, className, style }) => {
    return (
        <input type={type}
            maxLength={maxLength}
            style={style}
            className={classnames(styles.input, className)}
            value={value.value}
            onChange={e => value.value = e.target.value}
            placeholder={placeholder}
            required={required}
        />
    );
};