import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';

const less = require('./FileWindow.less');

export class FileWindowContent extends BaseWindowContent {

    protected content: JSX.Element = (
        <span style={{ color: 'white' }}>{this.props.window.name}</span>
    );
}