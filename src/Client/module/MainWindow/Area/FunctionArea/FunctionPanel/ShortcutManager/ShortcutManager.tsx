import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { ShortcutManagerPropsType } from './ShortcutManagerPropsType';

const less = require('./ShortcutManager.less');

/**
 * 快捷方式管理器
 */
export class ShortcutManager extends ObservableComponent<ShortcutManagerPropsType> {

    componentDidMount() {
        this.watch(this.props.functionAreaDisplayType);
    }

    render() {
        return (
            <div id="ShortcutManager" style={{ display: this.props.functionAreaDisplayType.value === 'shortcut' ? 'block' : 'none' }}>
                <span style={{ color: 'red' }}>ShortcutManager</span>
            </div>
        );
    }
}