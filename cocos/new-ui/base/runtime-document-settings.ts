
/*
 Copyright (c) 2017-2022 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { CameraComponent, Mat4, Rect, Size, Vec2 } from "../../core";
import { UIDocumentSettings } from "./ui-document-settings";
import { UISystem } from "./ui-system";

export enum RenderMode {
    OVERLAY,
    CAMERA,
    WORLD_SPACE,
}

export class UIRuntimeDocumentSettings extends UIDocumentSettings {

    private _camera: CameraComponent | null = null;
    private _planeDistance = 1000;

    get renderMode () {
        return this._renderMode;
    }

    set renderMode (val: RenderMode) {
        this._renderMode = val;
    }

    get camera () {
        return this._camera;
    }

    set camera (val) {
        this._camera = val;
    }

    get width () {
        return this._width;
    }

    set width (val) {
        this._width = val;
    }

    get height () {
        return this._height;
    }

    set height (val) {
        this._height = val;
    }

    get planeDistance () {
        return this._planeDistance;
    }

    set planeDistance (val) {
        this._planeDistance = val;
    }

    get lowLevelRenderCamera () {
        switch (this._renderMode) {
            case RenderMode.OVERLAY:
                return UISystem.instance.hudCamera;
            case RenderMode.CAMERA:
                return this._camera?.camera;
            case RenderMode.WORLD_SPACE:
                return null;
        }
    }

    public update () {
        switch (this._renderMode) {
            case RenderMode.OVERLAY:
                const hudCamera = UISystem.instance.hudCamera;
                this._document.setViewport(Rect.fromCenterSize(new Rect(), Vec2.ZERO, new Size(hudCamera.width, hudCamera.height)));
                this._document.setOrigin(hudCamera.node.worldMatrix);
                break;
            case RenderMode.CAMERA:
                const camera = this._camera?.camera;
            case RenderMode.WORLD_SPACE:
                this._document.setViewport(Rect.fromCenterSize(new Rect(), Vec2.ZERO, new Size(this._width, this._height)));
                this._document.setOrigin(Mat4.IDENTITY);
        }
    }

    private _width = 0;
    private _height = 0;
    private _renderMode = RenderMode.OVERLAY;
}