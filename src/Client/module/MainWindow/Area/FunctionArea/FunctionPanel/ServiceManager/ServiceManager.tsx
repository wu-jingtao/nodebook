import * as React from 'react';
import { oVar } from 'observable-variable';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { displayType } from '../../FunctionArea';

const less = require('./ServiceManager.less');

/**
 * 崩溃的服务数量
 */
export const crashedServiceNumber = oVar(0);

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
                <span style={{ color: 'red' }}>ServiceManager</span>
            </div>
        );
    }
}