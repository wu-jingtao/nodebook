import * as $ from 'jquery';
import * as React from 'react';
import * as monaco from 'monaco-editor';
import { ObservableVariable, watch, permanent_oArr } from 'observable-variable';
import debounce = require('lodash.debounce');

import { processingItems } from '../../../../../../global/Component/Tree/EditableFileTree/EditableFileTree';
import { normalSettings } from '../../../../../../global/SystemSetting';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { CodeEditorWindowArgs } from '../../ContentWindowTypes';
import { getCache, saveToServer } from './CodeEditorFileCache';
import { closeWindow } from '../../WindowList';

//#region 编辑器全局配置

//配置编辑器主题
monaco.editor.defineTheme('nodebook', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ token: '', "background": "#272822", "foreground": "#F8F8F2" }],
    colors: {
        "editor.foreground": "#F8F8F2",
        "editor.background": "#272822",
        "editor.selectionBackground": "#49483E",
        "editor.lineHighlightBackground": "#3E3D32",
        "editorCursor.foreground": "#F8F8F0",
        "editorWhitespace.foreground": "#3B3A32",
        "editorIndentGuide.activeBackground": "#9D550F",
        "editor.selectionHighlightBorder": "#222218"
    }
});

monaco.editor.setTheme('nodebook');

//阻止键盘默认行为
$(document).on('keydown', e => {
    if (e.ctrlKey && e.key === 's')
        e.preventDefault();
});

//加载tsd
monaco.languages.typescript.javascriptDefaults.addExtraLib(require('!raw-loader!../../../../../../../../node_modules/@types/jquery/index.d.ts'), 'jquery');
monaco.languages.typescript.javascriptDefaults.addExtraLib(require('!raw-loader!../../../../../../../../node_modules/@types/node/index.d.ts'), 'node');
monaco.languages.typescript.javascriptDefaults.addExtraLib(require('!raw-loader!../../../../../../../../node_modules/@types/node/inspector.d.ts'), 'node/inspector');
monaco.languages.typescript.javascriptDefaults.addExtraLib(require('!raw-loader!../../../../../../res/helper/client_helper.d.ts'), 'client_helper.js');
monaco.languages.typescript.javascriptDefaults.addExtraLib(require('!raw-loader!../../../../../../res/helper/server_helper.d.ts'), '/app/bin/Client/res/helper/server_helper.js');

//#endregion

export abstract class CodeEditorWindowContent extends BaseWindowContent<CodeEditorWindowArgs> {

    private readonly _lineNumbers = normalSettings.get('client.editor.lineNumbers') as ObservableVariable<boolean>;
    private readonly _smoothScrolling = normalSettings.get('client.editor.smoothScrolling') as ObservableVariable<boolean>;
    private readonly _minimap = normalSettings.get('client.editor.minimap') as ObservableVariable<boolean>;
    private readonly _fontSize = normalSettings.get('client.editor.fontSize') as ObservableVariable<number>;

    //代码编辑器滚动条位置
    private readonly _scrollPosition = permanent_oArr(`ui._codeEditor_scrollPosition_${this.props.args.args.path}`, { defaultValue: [0, 0], expire: 1000 * 60 * 60 * 24 * 30 });
    private _editor_div: HTMLDivElement;
    private _editor: monaco.editor.IEditor;

    protected _content = <div style={{ width: '100%', height: '100%' }} ref={(e: any) => this._editor_div = e} />;

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

    //键盘快捷键
    private _setKeyboardShortcut(ed: monaco.editor.IStandaloneCodeEditor) {
        ed.addAction({
            id: '格式化代码', label: '格式化代码',
            keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.US_QUOTE], //alt+'
            precondition: 'editorHasDocumentFormattingProvider && editorTextFocus && !editorReadonly',
            run: (ed) => { ed.getAction('editor.action.formatDocument').run() }
        });

        ed.addAction({
            id: '代码提示', label: '代码提示',
            keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.US_SLASH], //alt+/
            precondition: 'editorHasCompletionItemProvider && editorTextFocus && !editorReadonly',
            run: (ed) => { ed.getAction('editor.action.triggerSuggest').run() }
        });

        ed.addAction({
            id: '块注释', label: '块注释',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.US_SLASH],
            precondition: 'editorTextFocus && !editorReadonly',
            run: (ed) => { ed.getAction('editor.action.blockComment').run() }
        });

        ed.addAction({
            id: '前插入行', label: '前插入行',
            keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Enter],
            precondition: 'editorTextFocus && !editorReadonly',
            run: (ed) => { ed.getAction('editor.action.insertLineBefore').run() }
        });

        ed.addAction({
            id: '后插入行', label: '后插入行',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            precondition: 'editorTextFocus && !editorReadonly',
            run: (ed) => { ed.getAction('editor.action.insertLineAfter').run() }
        });

        ed.addAction({
            id: '删除行', label: '删除行',
            keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Delete],
            precondition: 'editorTextFocus && !editorReadonly',
            run: (ed) => { ed.getAction('editor.action.deleteLines').run() }
        });

        ed.addAction({
            id: '向下复制此行', label: '向下复制此行',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D],
            precondition: 'editorTextFocus && !editorReadonly',
            run: (ed) => { ed.getAction('editor.action.copyLinesDownAction').run() }
        });

        ed.addAction({
            id: '保存修改', label: '保存修改',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
            precondition: 'editorTextFocus && !editorReadonly',
            run: () => { saveToServer(this.props.args.args.path) }
        });
    }

    //配置和记录编辑器滚动条位置
    private _recordEditorScrollPosition(ed: monaco.editor.IStandaloneCodeEditor) {
        const dispose = ed.onDidChangeModel(() => { //等待编辑器加载完数据
            ed.setScrollTop(this._scrollPosition.get(0));
            ed.setScrollLeft(this._scrollPosition.get(1));

            ed.onDidScrollChange(e => {
                this._scrollPosition.set(0, e.scrollTop);
                this._scrollPosition.set(1, e.scrollLeft);
            });

            dispose.dispose();
        });
    }

    componentDidMount() {
        super.componentDidMount();

        //创建编辑器
        if (this.props.args.args.diff) {
            const editor = monaco.editor.createDiffEditor(this._editor_div, {
                ...this._getOptions(),
                readOnly: this.props.args.args.readonly
            });

            this._setKeyboardShortcut(editor.getModifiedEditor());

            this._editor = editor;
        } else {
            const editor = monaco.editor.create(this._editor_div, {
                ...this._getOptions(),
                readOnly: this.props.args.args.readonly
            });

            this._setKeyboardShortcut(editor);
            this._recordEditorScrollPosition(editor);

            this._editor = editor;
        }

        //更改编辑器窗口大小
        const observer: MutationObserver = new (window as any).ResizeObserver(debounce(() => this._editor.layout(), 100, { leading: true }));
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

                //当编辑器内容发生改变后，使窗口固定
                const unWatch = cache.modified.onDidChangeContent(() => {
                    this.props.args.fixed.value = true;
                    unWatch.dispose();
                });
            } else
                closeWindow(this.props.args.id, this.props.side);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._editor.dispose();
    }
}