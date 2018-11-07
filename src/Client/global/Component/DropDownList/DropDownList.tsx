import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';

const less = require('./DropDownList.less');

interface Args {

    /**
     * 输入值
     */
    value: ObservableVariable<string>;
    /**
     * 选项
     */
    options: { text: string, value: string }[];

    required?: boolean;
    className?: any;
    disabled?: boolean;
    autoFocus?: boolean;
}

/**
 * 文本输入框
 */
export const DropDownList: React.StatelessComponent<Args> = ({ value, options, required, className, disabled, autoFocus }) => {
    return (
        <select className={classnames(less.DropDownList, className)} value={value.value} autoFocus={autoFocus}
            disabled={disabled} required={required} onChange={e => value.value = e.target.value}>
            {options.map(({ text, value }) => <option key={value} value={value}>{text}</option>)}
        </select>
    );
};