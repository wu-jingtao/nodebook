import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { ServiceManagerPropsType } from './ServiceManagerPropsType';

const less = require('./ServiceManager.less');

/**
 * 服务管理器
 */
export class ServiceManager extends ObservableComponent<ServiceManagerPropsType> {

    componentDidMount() {
        this.watch(this.props.functionAreaDisplayType);
    }

    render() {
        return (
            <div id="ServiceManager" style={{ display: this.props.functionAreaDisplayType.value === 'service' ? 'block' : 'none' }}>
                <span style={{ color: 'red' }}>ServiceManager</span>
            </div>
        );
    }
}