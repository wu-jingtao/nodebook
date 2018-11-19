import * as React from 'react';

import { ObservableComponent } from '../../../../../../global/Tools/ObservableComponent';
import { displayType } from '../../LogWindow';

const less = require('./TerminalWindow.less');

export class TerminalWindowFunctionArea extends ObservableComponent {

    componentDidMount() {
        this.watch([displayType]);
    }

    render() {
        return (
            <div className={less.TerminalWindow} style={{ display: displayType.value === 'terminal' ? 'flex' : 'none' }}>
            </div>
        );
    }
}