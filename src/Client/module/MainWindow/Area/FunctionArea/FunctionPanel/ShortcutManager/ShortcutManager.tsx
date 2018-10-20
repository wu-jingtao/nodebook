import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { displayType } from '../../FunctionArea';
import { ShortcutPanel } from './ShortcutPanel';

/**
 * 快捷方式管理器
 */
export class ShortcutManager extends ObservableComponent {

    componentDidMount() {
        this.watch([displayType]);
    }

    render() {
        return (
            <div id="ShortcutManager" style={{ display: displayType.value === 'shortcut' ? 'block' : 'none' }}>
                <ShortcutPanel noFold title="快捷方式" uniqueID="_ShortcutPanel" />
            </div>
        );
    }
}