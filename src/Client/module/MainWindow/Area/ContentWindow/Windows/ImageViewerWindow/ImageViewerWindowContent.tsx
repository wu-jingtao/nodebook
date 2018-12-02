import * as React from 'react';
import { oVar } from 'observable-variable';

import { BaseWindowContent } from '../BaseWindow/BaseWindowContent';
import { ImageViewerWindowArgs } from '../../ContentWindowTypes';
import { ObservableComponentWrapper } from '../../../../../../global/Tools/ObservableComponent';

const less = require('./ImageViewerWindow.less');
const failed_image = require('!url-loader!./image_fail.png');

export class ImageViewerWindowContent extends BaseWindowContent<ImageViewerWindowArgs> {

    private readonly _img_href = oVar(`/file/api/readFile?path=${this.props.args.args.path}`);
    private readonly _img_zoom = oVar(1);       //图片缩放
    private readonly _img_offset_X = oVar(0);   //图片偏移X
    private readonly _img_offset_Y = oVar(0);   //图片偏移Y
    private _img_dragging = false;              //是否正在拖拽
    private _img_dragLastPosition_X = 0;        //上次鼠标拖拽的位置X
    private _img_dragLastPosition_Y = 0;        //上次鼠标拖拽的位置Y

    //图片加载失败
    private readonly _loadError = () => {
        this._img_href.value = failed_image;    //显示加载失败图片
    };

    //图片加载完成
    private readonly _loaded = () => {
        if (this._communicator.loading)
            this._communicator.loading.value = false;
    };

    //图片开始拖拽
    private readonly _dragStart = (e: React.MouseEvent) => {
        this._img_dragging = true;
        this._img_dragLastPosition_X = e.clientX;
        this._img_dragLastPosition_Y = e.clientY;
    };

    //图片正在拖拽
    private readonly _dragging = (e: React.MouseEvent) => {
        if (this._img_dragging) {
            this._img_offset_X.value += e.clientX - this._img_dragLastPosition_X;
            this._img_offset_Y.value += e.clientY - this._img_dragLastPosition_Y;

            this._img_dragLastPosition_X = e.clientX;
            this._img_dragLastPosition_Y = e.clientY;
        }
    };

    //图片结束拖拽
    private readonly _dragEnd = (e: React.MouseEvent) => {
        if (this._img_dragging) {
            this._img_dragging = false;
            this._img_offset_X.value += e.clientX - this._img_dragLastPosition_X;
            this._img_offset_Y.value += e.clientY - this._img_dragLastPosition_Y;

            this._img_dragLastPosition_X = e.clientX;
            this._img_dragLastPosition_Y = e.clientY;
        }
    };

    //图片缩放
    private readonly _zoom = (e: React.WheelEvent) => {
        const change = Math.max(this._img_zoom.value * 0.1, 0.03);   //改变大小为当前缩放比例的10%，最小为0.1
        this._img_zoom.value = Math.max(this._img_zoom.value + (e.deltaY < 0 ? change : -change), 0.1);
    };

    protected _content = (
        <div className={less.background}
            onMouseDown={this._dragStart}
            onMouseMove={this._dragging}
            onMouseUp={this._dragEnd}
            onMouseLeave={this._dragEnd}
            onMouseEnter={this._dragEnd}
            onWheel={this._zoom}>
            <ObservableComponentWrapper watch={[this._img_href, this._img_zoom, this._img_offset_X, this._img_offset_Y]}
                render={() => (
                    <img className={less.image} src={this._img_href.value} draggable={false}
                        style={{
                            transform: `scale(${this._img_zoom.value})`,
                            left: `${this._img_offset_X.value}px`,
                            top: `${this._img_offset_Y.value}px`,
                        }}
                        onError={this._loadError}
                        onLoad={this._loaded} />
                )} />
        </div>
    );

    constructor(props: any, context: any) {
        super(props, context);

        //刷新图片
        this._communicator.refresh = () => {
            this._communicator.loading.value = true;
            this._img_href.value = `/file/api/readFile?path=${this.props.args.args.path}&_=${Math.random()}`;
        };
    }
}