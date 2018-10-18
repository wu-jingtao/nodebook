import * as React from 'react';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { VideoPlayerWindowArgs } from '../../ContentWindowTypes';

const { Player } = require('video-react');

require('../../../../../../../../node_modules/video-react/dist/video-react.css');

export class VideoPlayerWindowContent extends BaseWindowContent<VideoPlayerWindowArgs> {

    private _ref_video: any;

    protected _content = (
        <Player fluid={false} width="100%" height="100%" ref={(e: any) => this._ref_video = e}>
            <source src={`/file/api/readFile?path=${this.props.args.args.path}`} />
        </Player>
    );

    constructor(props: any, context: any) {
        super(props, context);

        //刷新
        this.props.communicator.refresh = () => {
            if (this._ref_video)
                this._ref_video.load();
        };
    }
}