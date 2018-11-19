import * as React from 'react';
import { ObservableVariable, oVar } from 'observable-variable';

import { ObservableComponentWrapper } from '../../../../../../global/Tools/ObservableComponent';
import { BaseWindowFunctionButtons } from '../BaseWindow/BaseWindowFunctionButtons';
import { ServiceWindowArgs } from '../../ContentWindowTypes';
import { taskList, stopTask, startTask, restartTask } from '../../../FunctionArea/FunctionPanel/TaskManager/TaskList';
import { openTaskLogWindow } from '../../../LogWindow/Windows/TaskLogWindow/TaskLogWindowList';

export class ServiceWindowFunctionButtons extends BaseWindowFunctionButtons<ServiceWindowArgs> {

    private readonly _status = oVar<ObservableVariable<'running' | 'stop' | 'crashed'> | false>(false);

    protected _functionButtons = <ObservableComponentWrapper watch={[this._status]} render={() => (
        this._status.value && <ObservableComponentWrapper watch={[this._status.value]} render={() => (
            <>
                {(this._status.value as any).value === 'running' ? (
                    <>
                        <img src={`/static/res/img/buttons_icon/stop-inverse.svg`}
                            title={`停止服务`} onClick={() => stopTask(this.props.args.args.path)} />
                        <img src={`/static/res/img/buttons_icon/restart-inverse.svg`}
                            title={`重启服务`} onClick={() => restartTask(this.props.args.args.path)} />
                    </>
                ) : <img src={`/static/res/img/buttons_icon/start-inverse.svg`}
                    title={`启动服务`} onClick={() => startTask(this.props.args.args.path)} />}
                <img src={`/static/res/img/buttons_icon/repl-inverse.svg`} title={`查看日志`} onClick={() => openTaskLogWindow(this.props.args.args.path)} />
            </>
        )} />
    )} />

    componentDidMount() {
        super.componentDidMount();

        const getStatus = () => {
            if (taskList.has(this.props.args.args.path)) {
                this._status.value = taskList.get(this.props.args.args.path);
                unWatch();
            }
        }

        taskList.on('add', getStatus);
        const unWatch = () => taskList.off('add', getStatus);

        this._unobserve.push(unWatch);
        getStatus();
    }
}