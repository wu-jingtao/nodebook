import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { FileIcon } from '../../../../../../global/Component/FileIcon/FileIcon';
import { WindowPropsType } from '../WindowPropsType';

const windowStyle = require('../WindowStyle.less');

export class FileWindow extends ObservableComponent<WindowPropsType> {

    componentDidMount() {
        const name = this.props.name.split('/').pop() || '';

        this.props.title.value = (
            <div className={windowStyle.title}>
                <FileIcon className={windowStyle.titleIcon} filename={name} />
                <span className={windowStyle.titleText}>{name}</span>
            </div>
        );

        this.props.functionButtons.value = (
            <>
                <img className={windowStyle.button}
                    src={`/static/res/img/buttons_icon/next-inverse.svg`}
                    title={'test'}
                    onClick={() => { }} />
                <img className={windowStyle.button}
                    src={`/static/res/img/buttons_icon/next-inverse.svg`}
                    title={'test'}
                    onClick={() => { }} />
                <img className={windowStyle.button}
                    src={`/static/res/img/buttons_icon/next-inverse.svg`}
                    title={'test'}
                    onClick={() => { }} />
            </>
        );
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}