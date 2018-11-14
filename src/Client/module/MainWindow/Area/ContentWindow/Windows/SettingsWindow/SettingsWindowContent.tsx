import * as React from 'react';

import { ScrollBar } from '../../../../../../global/Component/ScrollBar/ScrollBar';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { SettingsWindowArgs } from '../../ContentWindowTypes';
import { ProgramNameAndIcon } from './SettingGroup/ProgramNameAndIcon/ProgramNameAndIcon';
import { CodeEditor } from './SettingGroup/CodeEditor/CodeEditor';
import { Task } from './SettingGroup/Task/Task';
import { UsernameAndPassword } from './SettingGroup/UsernameAndPassword/UsernameAndPassword';
import { Mail } from './SettingGroup/Mail/Mail';
import { UploadFile } from './SettingGroup/UploadFile/UploadFile';
import { AccessRestriction } from './SettingGroup/AccessRestriction/AccessRestriction';
import { BackupAndRestore } from './SettingGroup/BackupAndRestore/BackupAndRestore';
import { Library } from './SettingGroup/Library/Library';

const less = require('./SettingsWindow.less');

export class SettingsWindowContent extends BaseWindowContent<SettingsWindowArgs> {
    protected _content = (
        <ScrollBar className={less.SettingsWindowContent}>
            <UsernameAndPassword />
            <Mail />
            <AccessRestriction />
            <UploadFile />
            <BackupAndRestore />
            <Task />
            <Library />
            <CodeEditor />
            <ProgramNameAndIcon />
        </ScrollBar>
    );
}