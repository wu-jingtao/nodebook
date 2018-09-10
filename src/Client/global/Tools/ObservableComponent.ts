import * as React from 'react';
import { ObservableVariable, watch } from 'observable-variable';

/**
 * 可观察改变容器，方便与 ObservableVariable 结合使用
 */
export class ObservableComponent<p = {}> extends React.Component<p> {

    private _unobserve: Function[] = [];

    /**
     * 观察哪些 ObservableVariable 变量的变化，当其中某个的值发生改变后，重新渲染
     */
    watch(...args: ObservableVariable<any>[]) {
        this._unobserve.push(watch(args, this.forceUpdate.bind(this)));
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
        this.watch(...this.props.watch);
    }

    render() {
        return this.props.render();
    }
}