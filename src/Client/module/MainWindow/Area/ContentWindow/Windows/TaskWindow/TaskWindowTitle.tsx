import { watch } from 'observable-variable';

import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { TaskWindowArgs } from '../../ContentWindowTypes';
import { _processingTask } from '../../../FunctionArea/FunctionPanel/TaskManager/TaskList';

export class TaskWindowTitle extends BaseWindowTitle<TaskWindowArgs> {

    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/file_type_bolt.svg`;

    componentDidMount() {
        super.componentDidMount();

        //检查任务是否正在处理中
        const checkProcessing = () => {
            if (_processingTask.includes(this.props.args.args.path))
                this._loading.value = true;
            else
                this._loading.value = false;
        }

        this._unobserve.push(watch([_processingTask], checkProcessing));
        checkProcessing();
    }
}