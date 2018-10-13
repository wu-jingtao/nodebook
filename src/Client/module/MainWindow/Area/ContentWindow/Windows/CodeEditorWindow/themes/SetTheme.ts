import * as monaco from 'monaco-editor';

//定义主题
function defineTheme(name: string, data: any) {
    const colors: monaco.editor.IColors = data.colors;
    const rules: monaco.editor.ITokenThemeRule[] = [];

    data.tokenColors.forEach((item: any) => {
        const { scope = '', settings } = item;

        if (Array.isArray(scope))
            scope.forEach(scope => rules.push({ token: scope, ...settings }));
        else
            rules.push({ token: scope, ...settings });
    });

    monaco.editor.defineTheme(name, { base: 'vs', inherit: false, colors, rules });
}

defineTheme('monokai', require('./monokai-color-theme.json'));

/**
 * 设置编辑器主题
 */
export function setTheme(name: string): void {
    monaco.editor.setTheme(name);
}