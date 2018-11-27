import * as React from 'react';
import * as path from 'path';
import * as Markdown from 'react-markdown';
import debounce = require('lodash.debounce');

import { ServerApi } from '../../../../../../global/ServerApi';
import { ScrollBar } from '../../../../../../global/Component/ScrollBar/ScrollBar';
import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { showMessageBox } from '../../../../../MessageBox/MessageBox';
import { MarkdownViewerWindowArgs } from '../../ContentWindowTypes';
import { getCache } from '../CodeEditorWindow/CodeEditorFileCache';
import { closeWindow, openWindowByFilePath } from '../../WindowList';

const less = require('./MarkdownViewerWindow.less');

export class MarkdownViewerWindowContent extends BaseWindowContent<MarkdownViewerWindowArgs> {

    private _unmounted = false;
    protected _content: JSX.Element;

    //转换图片的地址
    private readonly markdown_transformImageUri = (url: string) => {
        return url.startsWith('http') ? url : `/file/api/readFile?path=${path.resolve(path.dirname(this.props.args.args.path), url)}`;
    };

    //元素渲染方法
    private readonly markdown_elementRender = {
        link: (props: any) => {
            const href = props.href;

            return (
                <a {...props} onClick={async (e) => {
                    if (!href.startsWith('http')) { //确保不是外连接
                        e.preventDefault();

                        const filePath = path.resolve(path.dirname(this.props.args.args.path), href);

                        if (!this._communicator.processing.has(filePath)) {
                            try {
                                this._communicator.processing.add(filePath);
                                const status = await ServerApi.file.fileStatus(filePath);
                                openWindowByFilePath(filePath, status.isBinary, status.size, undefined, true, true);
                            } catch (error) {
                                showMessageBox({ icon: 'error', title: '获取文件信息失败', content: error.message });
                            } finally {
                                this._communicator.processing.delete(filePath);
                            }
                        }
                    }
                }} />
            );
        }
    };

    componentDidMount() {
        super.componentDidMount();

        getCache(this.props.args.args.path).then(cache => {
            if (cache) {
                const onChange = debounce(() => {
                    if (!this._unmounted) {
                        this._content = (
                            <ScrollBar className={less.markdown}>
                                <Markdown linkTarget="_blank"
                                    source={cache.modified.getValue()}
                                    transformImageUri={this.markdown_transformImageUri}
                                    renderers={this.markdown_elementRender} />
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