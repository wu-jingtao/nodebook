import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';

const less = require('./TextInput.less');

interface Args {

    /**
     * 输入值
     */
    value: ObservableVariable<string>;

    type: 'text' | 'password' | 'email';
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    className?: any;
    disabled?: boolean;
    autoFocus?: boolean;
}

/**
 * 文本输入框
 */
export const TextInput: React.StatelessComponent<Args> = ({ value, type, placeholder, required, maxLength, className, disabled, autoFocus }) => {
    return (
        <input type={type}
            maxLength={maxLength}
            className={classnames(less.input, className)}
            value={value.value}
            onChange={e => value.value = e.target.value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
        />
    );
};