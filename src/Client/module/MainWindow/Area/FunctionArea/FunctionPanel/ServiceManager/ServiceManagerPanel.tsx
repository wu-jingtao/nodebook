import * as React from 'react';
import { oSet } from 'observable-variable';

import { FoldableContainer } from '../../../../../../global/Component/FoldableContainer/FoldableContainer';
import { FoldableContainerPropsType } from '../../../../../../global/Component/FoldableContainer/FoldableContainerPropsType';
import { showPopupWindow } from '../../../../../PopupWindow/PopupWindow';
import { ServiceTree } from './ServiceTree';
import { serviceList } from './ServiceManager';
import { startTask, stopTask } from '../TaskManager/TaskList';

const less = require('./ServiceManager.less');

export class ServiceManagerPanel extends FoldableContainer<FoldableContainerPropsType> {

    private _tree: ServiceTree;

    //新建服务
    private readonly _createService = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.createService();
    };

    //刷新服务
    private readonly _refreshServiceList = (e: React.MouseEvent) => {
        e.stopPropagation();
        this._tree.refreshServiceList();
    };

    //启动全部服务
    private readonly _startAllServices = (e: React.MouseEvent) => {
        e.stopPropagation();

        showPopupWindow({
            title: '启动全部服务',
            content: <span>确定要启动全部服务吗?</span>,
            ok: {
                callback: () => {
                    for (const path of serviceList.keys())
                        startTask(path);
                }
            }
        });
    };

    //停止全部服务
    private readonly _stopAllServices = (e: React.MouseEvent) => {
        e.stopPropagation();

        showPopupWindow({
            title: '停止全部服务',
            content: <span>确定要停止全部服务吗?</span>,
            ok: {
                callback: () => {
                    for (const path of serviceList.keys())
                        stopTask(path);
                }
            }
        });
    };

    protected renderTitleBar(): React.ReactNode {
        return (
            <div className={less.titleButtons}>
                <img title="新建服务" src="/static/res/img/buttons_icon/add_inverse.svg" onClick={this._createService} />
                <img title="启动全部服务" src="/static/res/img/buttons_icon/start-inverse.svg" onClick={this._startAllServices} />
                <img title="停止全部服务" src="/static/res/img/buttons_icon/stop-inverse.svg" onClick={this._stopAllServices} />
                <img title="刷新" src="/static/res/img/buttons_icon/Refresh_inverse.svg" onClick={this._refreshServiceList} />
            </div>
        );
    }

    protected renderContent(): React.ReactNode {
        return <ServiceTree name="服务列表" memorable="_ServiceTree" modifiedFiles={oSet<any>([])} ref={(e: any) => this._tree = e} />
    }
}
