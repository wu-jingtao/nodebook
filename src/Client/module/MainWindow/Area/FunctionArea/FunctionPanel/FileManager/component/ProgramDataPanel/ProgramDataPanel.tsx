import * as React from 'react';

import { ServerApi } from '../../../../../../../../global/ServerApi';
import { UserCodePanel, UserCodeTree } from '../UserCodePanel/UserCodePanel';
import { refreshRecycleRoot } from '../RecyclePanel/RecyclePanel';
import { unsavedFiles } from '../../../../../ContentWindow/Windows/CodeEditorWindow/CodeEditorFileCache';

/**
 * 程序数据目录
 */
export class ProgramDataPanel extends UserCodePanel {
    protected renderContent(): JSX.Element {
        return <ProgramDataTree
            name="/program_data"
            memorable={this.props.uniqueID}
            ref={(e: any) => this._tree = e}
            modifiedFiles={unsavedFiles} />
    }
}

class ProgramDataTree extends UserCodeTree {
    protected async _onDelete(): Promise<void> {
        await ServerApi.file.deleteProgramData(this._fullNameString);
        refreshRecycleRoot && refreshRecycleRoot();
        this._closeWindow();
        this._deleteUnsavedFile();
    }
}