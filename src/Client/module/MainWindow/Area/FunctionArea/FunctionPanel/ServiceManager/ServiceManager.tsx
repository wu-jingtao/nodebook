import * as React from 'react';
import { oMap, ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { displayType } from '../../FunctionArea';
import { ServiceManagerPanel } from './ServiceManagerPanel';

export interface ServiceListValueType {
    name: ObservableVariable<string>;
    auto_restart: ObservableVariable<boolean>;
    report_error: ObservableVariable<boolean>;
}

/**
 * 服务列表。key是运行文件的绝对路径
 */
export const serviceList = oMap<string, ServiceListValueType>([]);

/**
 * 服务管理器
 */
export class ServiceManager extends ObservableComponent {

    componentDidMount() {
        this.watch([displayType]);
    }

    render() {
        return (
            <div id="ServiceManager" style={{ display: displayType.value === 'service' ? 'block' : 'none' }}>
                <ServiceManagerPanel noFold title="服务管理器" uniqueID="_ServiceManagerPanel" />
            </div>
        );
    }
}