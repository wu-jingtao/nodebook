import * as React from 'react';

import * as FilePath from '../../../../../../../Server/FilePath';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { HtmlViewerWindowArgs } from '../../ContentWindowTypes';

const less = require('./HtmlViewerWindow.less');

export class HtmlViewerWindowContent extends BaseWindowContent<HtmlViewerWindowArgs> {

    private readonly _href: string;
    private _ref_iframe: HTMLIFrameElement;
    protected _content: React.ReactNode;

    constructor(props: any, context: any) {
        super(props, context);

        //由于html中会用到相对路径所以必须更改路径形式
        if (this.props.args.args.path.startsWith(FilePath._userCodeDir))
            this._href = this._communicator.href = `/file/data/code${this.props.args.args.path.replace(FilePath._userCodeDir, '')}`;
        else if (this.props.args.args.path.startsWith(FilePath._programDataDir))
            this._href = this._communicator.href = `/file/data/programData${this.props.args.args.path.replace(FilePath._programDataDir, '')}`;
        else if (this.props.args.args.path.startsWith(FilePath._recycleDir))
            this._href = this._communicator.href = `/file/data/recycle${this.props.args.args.path.replace(FilePath._recycleDir, '')}`;
        else if (this.props.args.args.path.startsWith(FilePath._libraryDir))
            this._href = this._communicator.href = `/file/data/library${this.props.args.args.path.replace(FilePath._libraryDir, '')}`;
        else
            this._href = this._communicator.href = this.props.args.args.path;

        this._content = (
            <iframe className={less.iframe}
                src={this._href}
                onLoad={() => this._communicator.loading.value = false}
                ref={(e: any) => this._ref_iframe = e} />
        );

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