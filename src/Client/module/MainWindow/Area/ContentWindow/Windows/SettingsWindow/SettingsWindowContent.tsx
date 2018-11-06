import * as React from 'react';

import { ScrollBar } from '../../../../../../global/Component/ScrollBar/ScrollBar';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { SettingsWindowArgs } from '../../ContentWindowTypes';
import { ProgramNameAndIcon } from './SettingGroup/ProgramNameAndIcon/ProgramNameAndIcon';

const less = require('./SettingsWindow.less');

export class SettingsWindowContent extends BaseWindowContent<SettingsWindowArgs> {
    protected _content = (
        <ScrollBar className={less.SettingsWindowContent}>
            <ProgramNameAndIcon />
        </ScrollBar>
    );
}