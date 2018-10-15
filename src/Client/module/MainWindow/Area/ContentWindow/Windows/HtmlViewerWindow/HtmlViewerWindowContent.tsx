import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { HtmlViewerWindowArgs } from '../../ContentWindowTypes';

const less = require('./HtmlViewerWindow.less');

export class HtmlViewerWindowContent extends BaseWindowContent<HtmlViewerWindowArgs> {

    private _ref_iframe: HTMLIFrameElement;

    protected _content = (
        <iframe className={less.iframe}
            src={'/file/api/readFile?path=' + this.props.args.args.path}
            onLoad={() => this.props.communicator.loading.value = false}
            ref={(e: any) => this._ref_iframe = e} />
    );

    constructor(props: any, context: any) {
        super(props, context);

        //刷新
        this.props.communicator.refresh = () => {
            if (this._ref_iframe) {
                if (this._ref_iframe.contentWindow) {
                    this.props.communicator.loading.value = true;
                    this._ref_iframe.contentWindow.location.reload();
                }
            }
        };
    }
}