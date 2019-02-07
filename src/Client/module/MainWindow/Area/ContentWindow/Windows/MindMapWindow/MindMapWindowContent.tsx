import * as React from 'react';
import { editor } from 'monaco-editor';
import debounce = require('lodash.debounce');

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { MindMapWindowArgs } from '../../ContentWindowTypes';
import { getCache } from '../CodeEditorWindow/CodeEditorFileCache';
import { closeWindow } from '../../WindowList';

const less = require('../HtmlViewerWindow/HtmlViewerWindow.less');

export class MindMapWindowContent extends BaseWindowContent<MindMapWindowArgs> {

    //容器是否已卸载
    private _unmounted = false;

    //内容区域索引
    private _ref: HTMLIFrameElement;

    //要显示的正文内容
    protected _content = (
        <iframe className={less.iframe}
            src="/static/res/kityminder-editor/index.html"
            ref={(e: any) => this._ref = e} />
    );

    componentDidMount() {
        super.componentDidMount();

        (this._ref.contentWindow as any).editorReady = () => {
            this._communicator.iframeReady();
            const minder = (this._ref.contentWindow as any).minder;

            getCache(this.props.args.args.path).then(cache => {
                if (cache) {
                    let contentVersion = cache.modified.getVersionId(); //获取当前内容的版本号
                    let isTriggeredByImport = false;    //是否是因minder.importJson触发的onSave

                    const onSave = debounce(() => {
                        if (!this._unmounted) {
                            if (!isTriggeredByImport) {
                                cache.modified.setValue(JSON.stringify(minder.exportJson()));
                                contentVersion = cache.modified.getVersionId();
                            } else
                                isTriggeredByImport = false;
                        }
                    }, 1000);

                    const onChange = debounce((e?: editor.IModelContentChangedEvent) => {
                        if (!this._unmounted) {
                            if (e === undefined || e.versionId > contentVersion) {
                                isTriggeredByImport = true;
                                minder.importJson(JSON.parse(cache.modified.getValue()));
                            }
                        }
                    }, 500);

                    minder.on('contentchange', onSave); //编辑器内容发生改变

                    onChange();
                    const unWatch = cache.modified.onDidChangeContent(onChange);

                    this._unobserve.push(cache.dispose);
                    this._unobserve.push(() => {
                        unWatch.dispose();
                        minder.off('contentchange', onSave);
                    });
                } else
                    closeWindow(this.props.args.id, this.props.side);
            });
        };
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._unmounted = true;
    }
}