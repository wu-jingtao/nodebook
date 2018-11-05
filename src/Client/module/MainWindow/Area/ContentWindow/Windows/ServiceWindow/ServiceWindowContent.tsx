import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../global/Tools/ObservableComponent';
import { Container } from '../../../../../../global/Component/Container/Container';
import { CheckBox } from '../../../../../../global/Component/CheckBox/CheckBox';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { ServiceWindowArgs } from '../../ContentWindowTypes';
import { TaskWindowChart } from '../TaskWindow/TaskWindowChart/TaskWindowChart';
import { serviceList, ServiceListValueType } from '../../../FunctionArea/FunctionPanel/ServiceManager/ServiceManager';

const less = require('./ServiceWindow.less');

export class ServiceWindowContent extends BaseWindowContent<ServiceWindowArgs> {

    private _config = oVar<ServiceListValueType | false>(false);

    protected _content = <ObservableComponentWrapper watch={[this._config]} render={() => (
        this._config.value && <ObservableComponentWrapper watch={[this._config.value.auto_restart, this._config.value.report_error]} render={() => (
            <>
                <Container className={less.config}>
                    <div className={less.configItem} style={{ textAlign: 'center' }}>程序: {this.props.args.args.path}</div>
                    <CheckBox className={less.configItem} text="自动重启" value={(this._config.value as any).auto_restart} disabled />
                    <CheckBox className={less.configItem} text="崩溃自动报告异常" value={(this._config.value as any).report_error} disabled />
                </Container>
                <TaskWindowChart className={less.taskInfo} taskPath={this.props.args.args.path} />
            </>
        )} />
    )} />

    componentDidMount() {
        super.componentDidMount();

        const getConfig = () => {
            if (serviceList.has(this.props.args.args.path)) {
                this._config.value = serviceList.get(this.props.args.args.path);
                unWatch();
            }
        }

        serviceList.on('add', getConfig);
        const unWatch = () => serviceList.off('add', getConfig);

        this._unobserve.push(unWatch);
        getConfig();
    }
}