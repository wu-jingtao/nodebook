import * as React from 'react';

import { FoldableContainer } from '../FoldableContainer/FoldableContainer';
import { FileBrowserPropsType } from './FileBrowserPropsType';

const less = require('./FileBrowser.less');

/**
 * 文件资源浏览器
 */
export class FileBrowser extends FoldableContainer<FileBrowserPropsType> {

    protected _titleBarClassName = less.titleBar;
    protected _contentClassName = this.props.scrollable ? less.contentBox : less.noScrollContentBox;

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    protected renderTitleBar(): JSX.Element {
        return (
            <div className={less.titleButtons}>
                <i title="新建文件" className="iconfont icon-file-add-fill" onClick={e => e.stopPropagation()} />
                <i title="新建文件夹" className="iconfont icon-file2" onClick={e => e.stopPropagation()} />
                <i title="刷新" className="iconfont icon-fresh" onClick={e => e.stopPropagation()} />
                <i title="全部折叠" className="iconfont icon-iconcloseall" onClick={e => e.stopPropagation()} />
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        return (
            <pre style={{ color: 'white' }}>
                {'content\n'.repeat(100)}
            </pre>
        );
    }
}