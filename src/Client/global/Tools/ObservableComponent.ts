import * as React from 'react';
import { ObservableVariable, watch } from 'observable-variable';
import _throttle = require('lodash.throttle');

/**
 * 可观察改变容器，方便与 ObservableVariable 结合使用
 */
export class ObservableComponent<p = {}> extends React.Component<p> {

    protected _unobserve: Function[] = [];

    /**
     * 观察指定 ObservableVariable 变量的变化，当其中某个的值发生改变后，重新渲染
     * @param throttle 规定在多长时间之内最多渲染一次，默认1
     */
    watch(args: ObservableVariable<any>[], throttle: number = 1) {
        this._unobserve.push(watch(args, throttle > 0 ?
            _throttle(() => this.forceUpdate(), throttle) : () => this.forceUpdate()));
    }

    componentWillUnmount() {
        this._unobserve.forEach(item => item());
    }

    shouldComponentUpdate() {
        return false;
    }
}

/**
 * 包装一段JSX，使之根据观察ObservableVariabled的改变而渲染
 */
export class ObservableComponentWrapper extends ObservableComponent<{ watch: ObservableVariable<any>[], render: (children?: React.ReactNode) => React.ReactNode }>{
    componentDidMount() {
        this.watch(this.props.watch);
    }

    render() {
        return this.props.render();
    }
}