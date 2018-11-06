import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableVariable } from 'observable-variable';

const less = require('./CheckBox.less');

interface Args {
    value: ObservableVariable<boolean>;
    text: string;
    className?: any;
    disabled?: boolean;
}

/**
 * 单选框
 */
export const CheckBox: React.StatelessComponent<Args> = ({ value, text, className, disabled }) => {
    return (
        <div className={classnames(less.checkBox, { checked: value.value, disabled: disabled }, className)}>
            <div className="CheckBox_text" onClick={() => { if (!disabled) value.value = !value.value }}>{text}</div>
            <div className="CheckBox_box" onClick={() => { if (!disabled) value.value = !value.value }}></div>
        </div>
    );
};