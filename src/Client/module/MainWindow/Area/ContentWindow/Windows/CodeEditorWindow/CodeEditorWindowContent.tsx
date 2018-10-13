import * as $ from 'jquery';
import * as React from 'react';
import * as monaco from 'monaco-editor';
import { ObservableVariable, watch } from 'observable-variable';
import debounce = require('lodash.debounce');

import { processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { normalSettings } from '../../../../../../global/SystemSetting';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';
import { closeWindow } from '../../WindowList';
import { getCache, saveToServer } from './CodeEditorFileCache';
import { setTheme } from './Themes/SetTheme';

//配置编辑器主题
setTheme('monokai');

//阻止键盘默认行为
$(document).on('keydown', e => {
    if (e.ctrlKey && e.key === 's')
        e.preventDefault();
});

export abstract class CodeEditorWindowContent extends BaseWindowContent<CodeEditorWindowArgs> {

    private readonly _lineNumbers = normalSettings.get('client.editor.lineNumbers') as ObservableVariable<boolean>;
    private readonly _smoothScrolling = normalSettings.get('client.editor.smoothScrolling') as ObservableVariable<boolean>;
    private readonly _minimap = normalSettings.get('client.editor.minimap') as ObservableVariable<boolean>;
    private readonly _fontSize = normalSettings.get('client.editor.fontSize') as ObservableVariable<number>;

    private _editor_div: HTMLDivElement;
    private _editor: monaco.editor.IEditor;

    protected _content = <div style={{ width: '100%', height: '100%' }} ref={(e: any) => this._editor_div = e} />

    //获取编辑器参数
    private _getOptions(): monaco.editor.IEditorOptions {
        return {
            lineNumbers: this._lineNumbers.value ? 'on' : 'off',
            smoothScrolling: this._smoothScrolling.value,
            minimap: { enabled: this._minimap.value },
            fontSize: this._fontSize.value,
            mouseWheelZoom: true,
            dragAndDrop: true
        };
    }

    componentDidMount() {
        super.componentDidMount();

        //Ctrl+S 保存数据
        const saveData = (e: monaco.IKeyboardEvent) => {
            if (e.ctrlKey && e.keyCode === monaco.KeyCode.KEY_S) {
                saveToServer(this.props.args.args.path);
            }
        };

        //创建编辑器
        if (this.props.args.args.diff) {
            const editor = monaco.editor.createDiffEditor(this._editor_div, {
                ...this._getOptions(),
                readOnly: this.props.args.args.readonly
            });

            editor.getModifiedEditor().onKeyDown(saveData);

            this._editor = editor;
        } else {
            const editor = monaco.editor.create(this._editor_div, {
                ...this._getOptions(),
                readOnly: this.props.args.args.readonly
            });

            editor.onKeyDown(saveData);

            this._editor = editor;
        }

        //更改编辑器窗口大小
        const observer: MutationObserver = new (window as any).ResizeObserver(debounce(() => this._editor.layout(), 100));
        observer.observe(this._editor_div);
        this._unobserve.push(() => observer.disconnect());

        //修改编辑器配置
        this._unobserve.push(watch([this._lineNumbers, this._smoothScrolling, this._minimap, this._fontSize], () => {
            this._editor.updateOptions(this._getOptions());
        }));

        //保存数据时禁止修改
        if (!this.props.args.args.readonly) {
            const _watch_processingItems_add = (value: string) => {
                if (value === this.props.args.args.path)
                    this._editor.updateOptions({ readOnly: true });
            };

            const _watch_processingItems_remove = (value: string) => {
                if (value === this.props.args.args.path)
                    this._editor.updateOptions({ readOnly: false });
            };

            //判断当前是否正在操作中
            if (processingItems.has(this.props.args.args.path))
                _watch_processingItems_add(this.props.args.args.path);

            processingItems.on('add', _watch_processingItems_add);
            processingItems.on('remove', _watch_processingItems_remove);

            this._unobserve.push(() => {
                processingItems.off('add', _watch_processingItems_add);
                processingItems.off('remove', _watch_processingItems_remove);
            });
        }

        //读取数据
        getCache(this.props.args.args.path).then(cache => {
            if (cache) {
                if (this.props.args.args.diff)
                    this._editor.setModel(cache);
                else
                    this._editor.setModel(cache.modified);

                this._editor.onDidDispose(cache.dispose);
            } else
                closeWindow(this.props.args.id, this.props.side);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._editor.dispose();
    }
}