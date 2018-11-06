import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';

const less = require('./NumberInput.less');

interface Args {

    /**
     * 输入值
     */
    value: ObservableVariable<number>;

    min?: number;
    max?: number;
    step?: number;
    className?: any;
    disabled?: boolean;
    autoFocus?: boolean;
}

/**
 * 数字输入框
 */
export const NumberInput: React.StatelessComponent<Args> = ({ value, min, max, step, className, disabled, autoFocus }) => {
    return (
        <input type="number"
            min={min}
            max={max}
            step={step}
            className={classnames(less.input, className)}
            value={value.value}
            onChange={e => value.value = e.target.valueAsNumber}
            disabled={disabled}
            autoFocus={autoFocus}
        />
    );
};