import * as React from 'react';
import * as classnames from 'classnames';
import { ObservableArray, ObservableVariable, oVar, watch } from 'observable-variable';

import { ObservableComponent } from '../../Tools/ObservableComponent';
import { permanent_oArr, permanent_oVar } from '../../Tools/PermanentVariable';
import { throttle } from '../../Tools/Tools';
import { Splitter } from '../Splitter/Splitter';
import { FoldableContainer } from '../FoldableContainer/FoldableContainer';
import { MultipleFoldableContainerPropsType, MultipleFoldableContainerItemPropsType, MultipleFoldableContainerSplitterPropsType } from './MultipleFoldableContainerPropsType';

const less = require('./MultipleFoldableContainer.less');

/**
 * 多个可折叠容器垂直排列，可改变每个容器的高度。
 */
export abstract class MultipleFoldableContainer<T extends MultipleFoldableContainerPropsType> extends ObservableComponent<T> {

    private _ref: JQuery<HTMLDivElement>;

    //容器期待的高度
    private readonly _containerExpectHeight: ObservableArray<number> = permanent_oArr(`ui.MultipleFoldableContainer._containerExpectHeight._${this.props.uniqueID}`);

    //每个容器的实际高度
    private readonly _containerActualHeight: ObservableVariable<number>[] = [];

    //容器是否折叠
    private readonly _containerFolded: ObservableVariable<boolean>[] = [];

    /**
     * 需要渲染的可折叠容器
     */
    protected abstract foldableContainers: JSX.Element[];

    //拖拽分隔条改变容器高度
    private readonly _changeHeight = (splitterIndex: number, position: number) => {
        let topHeight = 25 * (splitterIndex + 1);   //计算顶部其他容器的高度。25是标题栏高度

        for (let index = 0; index < splitterIndex; index++) {
            topHeight += this._containerActualHeight[index].value;
        }

        this._containerExpectHeight.set(splitterIndex, Math.max(position - (this._ref.offset() as any).top - topHeight, 0));
    }

    //计算每个容器高度
    private readonly _calculateHeight = () => {
        let remain = (this._ref.height() as any) - 25 * this._containerExpectHeight.length;    //剩下的可分配高度
        let lastHeight: ObservableVariable<number> | undefined = undefined;     //最后一个未折叠容器的高度

        //先分配排在上面的容器，最后剩下的部分全部留给最后一个未折叠的容器
        for (let index = 0; index < this._containerExpectHeight.length; index++) {
            const expect = this._containerExpectHeight.get(index);
            const actual = this._containerActualHeight[index];
            const folded = this._containerFolded[index];

            if (folded.value) {
                actual.value = 0;
            } else {
                lastHeight = actual;

                if (expect <= remain) {
                    actual.value = expect;
                    remain -= expect;
                } else {
                    actual.value = remain;
                    remain -= remain;
                }
            }
        }

        if (lastHeight) lastHeight.value += remain;
    };

    UNSAFE_componentWillMount() {
        for (let index = 0; index < this.foldableContainers.length; index++) {
            if (!this._containerExpectHeight.has(index)) //配置期待高度
                this._containerExpectHeight.set(index, 300);

            this._containerActualHeight.push(oVar(0));
            this._containerFolded.push(permanent_oVar(`ui.MultipleFoldableContainer._containerFolded._${this.props.uniqueID}.${index}`, 'false'));
        }
    }

    componentDidMount() {
        //观察MultipleFoldableContainer DIV 大小的改变。目前tsd还没有ResizeObserver的定义
        (new (window as any).ResizeObserver(throttle(this._calculateHeight, 5))).observe(this._ref[0]);

        watch([this._containerExpectHeight, ...this._containerFolded], throttle(this._calculateHeight, 1));

        this._calculateHeight();
    }

    render() {
        const elements = this.foldableContainers.map((item, index) => {
            if (index === 0)
                return React.cloneElement(item, { key: index, _height: this._containerActualHeight[index], folded: this._containerFolded[index] });
            else {
                //最后一个分隔条要显示，需要上下两个容器都未折叠
                return (
                    <React.Fragment key={index}>
                        <MultipleFoldableContainerSplitter index={index - 1}
                            folded={this._containerFolded.slice(index - 1, index === this.foldableContainers.length - 1 ? 2 : 1)}
                            changeHeight={this._changeHeight} />
                        {React.cloneElement(item, { _height: this._containerActualHeight[index], folded: this._containerFolded[index] })}
                    </React.Fragment>
                );
            }
        });

        return (
            <div className={classnames(less.MultipleFoldableContainer, this.props.className)} ref={(e: any) => this._ref = e && $(e)}>
                {elements}
            </div>
        );
    }
}

export abstract class MultipleFoldableContainerItem<T extends MultipleFoldableContainerItemPropsType> extends FoldableContainer<T>{

    componentDidMount() {
        super.componentDidMount();
        this.watch(this.props._height as any);
    }

    render() {
        this._contentStyle.height = (this.props._height as any).value + 'px';
        return super.render();
    }
}

class MultipleFoldableContainerSplitter extends ObservableComponent<MultipleFoldableContainerSplitterPropsType>{

    componentDidMount() {
        this.watch(...this.props.folded);
    }

    render() {
        return (
            <Splitter className={less.MultipleFoldableContainerSplitter} vertical
                style={{ display: this.props.folded.some(item => item.value) ? 'none' : 'block' }}
                onChange={position => this.props.changeHeight(this.props.index, position)} />
        );
    }
}