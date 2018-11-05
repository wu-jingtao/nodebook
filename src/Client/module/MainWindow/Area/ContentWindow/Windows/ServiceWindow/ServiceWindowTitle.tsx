import { watch } from 'observable-variable';

import { BaseWindowTitle } from '../BaseWindow/BaseWindowTitle';
import { ServiceWindowArgs } from '../../ContentWindowTypes';
import { _processingTask } from '../../../FunctionArea/FunctionPanel/TaskManager/TaskList';

export class ServiceWindowTitle extends BaseWindowTitle<ServiceWindowArgs> {

    protected _prompt = this.props.args.args.path;
    protected _icon = `/static/res/img/file_icons/file_type_apib2.svg`;

    componentDidMount() {
        super.componentDidMount();

        //检查服务是否正在处理中
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