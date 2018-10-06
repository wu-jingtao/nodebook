import * as React from 'react';
import * as monaco from 'monaco-editor';
import { ObservableVariable, watch } from 'observable-variable';

import { normalSettings } from '../../../../../../global/SystemSetting';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';


//配置编辑器主题
const theme_monokai = require('./themes/Monokai.json');
monaco.editor.defineTheme('Monokai', theme_monokai);
monaco.editor.setTheme('Monokai');

export abstract class CodeEditorWindowContent extends BaseWindowContent<CodeEditorWindowArgs> {

    private readonly _lineNumbers = normalSettings.get('client.editor.lineNumbers') as ObservableVariable<boolean>;
    private readonly _smoothScrolling = normalSettings.get('client.editor.smoothScrolling') as ObservableVariable<boolean>;
    private readonly _minimap = normalSettings.get('client.editor.minimap') as ObservableVariable<boolean>;
    private readonly _fontSize = normalSettings.get('client.editor.fontSize') as ObservableVariable<number>;

    private _editor_div: HTMLDivElement;
    private _editor: monaco.editor.IEditor;

    protected _content = <div style={{ width: '100%', height: '100%' }} ref={(e: any) => this._editor_div = e} />
    protected _onFocused() { this._editor.focus(); this._editor.layout(); }

    //获取编辑器参数
    private _getOptions(): monaco.editor.IEditorOptions {
        return {
            lineNumbers: this._lineNumbers.value ? 'on' : 'off',
            smoothScrolling: this._smoothScrolling.value,
            minimap: { enabled: this._minimap.value },
            fontSize: this._fontSize.value,
            mouseWheelZoom: true,
            dragAndDrop: true,
            readOnly: this.props.args.args.readonly
        };
    }

    componentDidMount() {
        super.componentDidMount();
    
        if (this.props.args.args.diff) {
            this._editor = monaco.editor.createDiffEditor(this._editor_div, this._getOptions());
        } else {
            this._editor = monaco.editor.create(this._editor_div, this._getOptions());
        }

        this._unobserve.push(watch([this._lineNumbers, this._smoothScrolling, this._minimap, this._fontSize], () => {
            this._editor.updateOptions(this._getOptions());
        }));
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._editor.dispose();
    }
}