import * as React from 'react';
import * as classnames from 'classnames';

import { ObservableComponent } from '../../../../../../../../../global/Tools/ObservableComponent';
import { TextInput } from '../../../../../../../../../global/Component/TextInput/TextInput';
import { InputPackageNamePropsType } from './InputPackageNamePropsType';

const less = require('./InputPackageName.less');

/**
 * 输入类库名称
 */
export class InputPackageName extends ObservableComponent<InputPackageNamePropsType> {

    constructor(props: any, context: any) {
        super(props, context);

        this.watch([this.props.name]);

        const validator = (value: string) => {
            if (value === '')
                this.props.errorTip.value = '类库名不能为空';
            else if (this.props.installedList.some(item => item.name === value))
                this.props.errorTip.value = '类库已经安装了，不能重复安装';
            else
                this.props.errorTip.value = '';
        }

        this.props.name.on('beforeSet', validator);

        if (this.props.name.value)  //如果有默认类库名就先验证一下默认类库名
            validator(this.props.name.value);
    }

    render() {
        return (
            <div className={classnames(less.InputPackageName, { [less.error]: this.props.errorTip.value })}>
                <TextInput className={less.input} placeholder="请输入要安装的类库名称" maxLength={100} type="text" value={this.props.name} autoFocus />
                {this.props.errorTip.value && <div className={less.errorTip}>{this.props.errorTip.value}</div>}
            </div>
        );
    }
}