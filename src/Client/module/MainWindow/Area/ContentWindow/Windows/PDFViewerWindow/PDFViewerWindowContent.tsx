import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { PDFViewerWindowArgs } from '../../ContentWindowTypes';

export class PDFViewerWindowContent extends BaseWindowContent<PDFViewerWindowArgs> {

    private _ref_iframe: HTMLIFrameElement;

    protected _content = (
        <iframe style={{ border: 'none', height: '100%', width: '100%' }}
            src={`/file/api/readFile?path=${this.props.args.args.path}`}
            onLoad={() => this._communicator.loading.value = false}
            ref={(e: any) => this._ref_iframe = e} />
    );

    constructor(props: any, context: any) {
        super(props, context);

        //刷新
        this._communicator.refresh = () => {
            if (this._ref_iframe) {
                this._communicator.loading.value = true;
                this._ref_iframe.src = `/file/api/readFile?path=${this.props.args.args.path}&_=${Math.random()}`;
            }
        };
    }
}