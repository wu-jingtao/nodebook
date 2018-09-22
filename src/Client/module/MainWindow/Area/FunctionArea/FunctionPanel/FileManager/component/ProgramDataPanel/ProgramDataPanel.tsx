import * as React from 'react';
import { ObservableVariable } from 'observable-variable';

import { EditableFileTree } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { EditableFileTreePropsType } from '../../../../../../../../global/Component/Tree/EditableFileTree/EditableFileTreePropsType';
import { FoldableContainerPropsType } from '../../../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { cachedFiles } from '../../UnsavedFiles';
import { UserCodePanel } from '../UserCodePanel/UserCodePanel';

const less = require('./ProgramDataPanel.less');

/**
 * 程序数据目录
 */
export class ProgramDataPanel extends UserCodePanel<FoldableContainerPropsType & { height: ObservableVariable<number> }> {

    protected _contentClassName = less.contentBox;

    componentDidMount() {
        super.componentDidMount();
        this.watch(this.props.height);
    }

    protected renderContent(): JSX.Element {
        return <ProgramDataTree
            name="/program_data"
            memorable={this.props.uniqueID}
            ref={(e: any) => this._tree = e}
            modifiedFiles={cachedFiles} />
    }

    render() {
        this._contentStyle = { height: this.props.height + 'px' };
        return super.render();
    }
}

class ProgramDataTree extends EditableFileTree<EditableFileTreePropsType>{

    protected async _onDelete(): Promise<void> {
        await ServerApi.file.deleteProgramData(this._fullNameString);
    }

    protected _onOpenItem(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 1000);
        });
    }
}