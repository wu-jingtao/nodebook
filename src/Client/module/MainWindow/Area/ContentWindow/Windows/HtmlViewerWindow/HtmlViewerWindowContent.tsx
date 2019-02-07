import * as React from 'react';

import * as FilePath from '../../../../../../../Server/FilePath';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { HtmlViewerWindowArgs } from '../../ContentWindowTypes';

const less = require('./HtmlViewerWindow.less');

/**
 * 由于html中会用到相对路径所以必须更改路径形式
 */
export function getHref(path: string) {
    if (path.startsWith(FilePath._userCodeDir))
        return `/file/data/code${path.replace(FilePath._userCodeDir, '')}`;
    else if (path.startsWith(FilePath._programDataDir))
        return `/file/data/programData${path.replace(FilePath._programDataDir, '')}`;
    else if (path.startsWith(FilePath._recycleDir))
        return `/file/data/recycle${path.replace(FilePath._recycleDir, '')}`;
    else if (path.startsWith(FilePath._libraryDir))
        return `/file/data/library${path.replace(FilePath._libraryDir, '')}`;
    else
        return path;
}

export class HtmlViewerWindowContent extends BaseWindowContent<HtmlViewerWindowArgs> {

    private _ref_iframe: HTMLIFrameElement;

    protected _content = (
        <iframe className={less.iframe}
            src={getHref(this.props.args.args.path)}
            onLoad={() => this._communicator.loading.value = false}
            ref={(e: any) => this._ref_iframe = e} />
    );

    constructor(props: any, context: any) {
        super(props, context);

        //刷新
        this._communicator.refresh = () => {
            if (this._ref_iframe) {
                if (this._ref_iframe.contentWindow) {
                    this._communicator.loading.value = true;
                    this._ref_iframe.contentWindow.location.reload();
                }
            }
        };
    }
}