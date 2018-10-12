import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { ServiceWindowArgs } from '../../ContentWindowTypes';

const less = require('./ServiceWindow.less');

export class ServiceWindowContent extends BaseWindowContent<ServiceWindowArgs> {

    protected _content: JSX.Element;

}