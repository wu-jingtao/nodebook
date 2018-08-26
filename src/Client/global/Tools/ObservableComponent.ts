import * as React from 'react';
import { ObservableVariable, watch } from 'observable-variable';

/**
 * 可观察改变容器，方便与 ObservableVariable 结合使用
 */
export class ObservableComponent extends React.Component {

    private _unobserve: Function;

    /**
     * 观察哪些 ObservableVariable 变量的变化，当其中某个的值发生改变后，重新渲染
     */
    watch(...args: ObservableVariable<any>[]) {
        this._unobserve = watch(args, this.forceUpdate.bind(this));
    }

    componentWillUnmount() {
        this._unobserve();
    }

    shouldComponentUpdate() {
        return false;
    }
}