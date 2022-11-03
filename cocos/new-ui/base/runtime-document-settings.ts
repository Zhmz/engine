
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

import { assert, Root } from "../../core";
import { legacyCC } from "../../core/global-exports";
import { Camera } from "../../core/renderer/scene";
import { UIDocumentSettings } from "./ui-document-settings";

export enum RenderMode {
    OVERLAY,
    CAMERA,
    WORLD_SPACE,
}

export class UIRuntimeDocumentSettings extends UIDocumentSettings {

    get renderMode () {
        return this._renderMode;
    }

    set renderMode (val: RenderMode) {
        if (this._renderMode === val) return;
        if (this._renderMode === RenderMode.OVERLAY) {
            if (this._camera) {
                this._camera.destroy();
                this._camera = null;
            }
        } else {
            this._detachFromScene();
        }
        if (val === RenderMode.OVERLAY) {
            // use builtin camera
            this._initCamera();
        } else {
            // XXX
            // from component
            // this._camera = XXX; 
        }

        this._attachToScene();
        this._renderMode = val;
    }

    get camera () {
        assert(this._camera, 'this._camera should not be invalid');
        return this._camera;
    }

    // todo
    private _initCamera () {
        if (!this._camera) {
            this._camera = (legacyCC.director.root as Root).createCamera();
            // // todo set camera property
            // this._camera.initialize({
            //     name: this.node.name,
            //     node: this.node,
            //     projection: this._projection,
            //     window: this._inEditorMode ? legacyCC.director.root && legacyCC.director.root.mainWindow
            //         : legacyCC.director.root && legacyCC.director.root.tempWindow,
            //     priority: this._priority,
            //     cameraType: this.cameraType,
            //     trackingType: this.trackingType,
            // });

            // this._camera.setViewportInOrientedSpace(this._rect);
            // this._camera.fovAxis = this._fovAxis;
            // this._camera.fov = toRadian(this._fov);
            // this._camera.orthoHeight = this._orthoHeight;
            // this._camera.nearClip = this._near;
            // this._camera.farClip = this._far;
            // this._camera.clearColor = this._color;
            // this._camera.clearDepth = this._depth;
            // this._camera.clearStencil = this._stencil;
            // this._camera.clearFlag = this._clearFlags;
            // this._camera.visibility = this._visibility;
            // this._camera.aperture = this._aperture;
            // this._camera.shutter = this._shutter;
            // this._camera.iso = this._iso;
        }

        // this._updateTargetTexture(); todo
        // this._camera.changeTargetWindow(window); // target
        // this._camera.setFixedSize(window!.width, window!.height); // resize
    }

    private _attachToScene () {
        if (!this._camera) {
            return;
        }
        if (this._camera && this._camera.scene) {
            this._camera.scene.removeCamera(this._camera);
        }
        const rs = (legacyCC.director.root as Root).scenes[0]; //todo & hack  need renderScene
        rs.addCamera(this._camera);
    }

    private _detachFromScene () {
        if (this._camera && this._camera.scene) {
            this._camera.scene.removeCamera(this._camera);
        }
    }

    private _renderMode = RenderMode.OVERLAY;
    private _camera :Camera| null = null;

}