import * as React from 'react';
import * as Markdown from 'react-markdown';
import debounce = require('lodash.debounce');

import { ScrollBar } from '../../../../../../global/Component/ScrollBar/ScrollBar';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { MarkdownViewerWindowArgs } from '../../ContentWindowTypes';
import { getCache } from '../CodeEditorWindow/CodeEditorFileCache';
import { closeWindow } from '../../WindowList';

const less = require('./MarkdownViewerWindow.less');

export class MarkdownViewerWindowContent extends BaseWindowContent<MarkdownViewerWindowArgs> {

    private _unmounted = false;
    protected _content: JSX.Element;

    componentDidMount() {
        super.componentDidMount();

        getCache(this.props.args.args.path).then(cache => {
            if (cache) {
                const onChange = debounce(() => {
                    if (!this._unmounted) {
                        this._content = (
                            <ScrollBar className={less.markdown}>
                                <Markdown escapeHtml={false} linkTarget="_blank" source={cache.modified.getValue()} />
                            </ScrollBar>
                        );
                        this.forceUpdate();
                    }
                }, 500);

                onChange();
                const unWatch = cache.modified.onDidChangeContent(onChange);

                this._unobserve.push(cache.dispose);
                this._unobserve.push(() => unWatch.dispose());
            } else
                closeWindow(this.props.args.id, this.props.side);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._unmounted = true;
    }
}