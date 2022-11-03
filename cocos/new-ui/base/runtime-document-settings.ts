
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

import { assert, CameraComponent, Root } from "../../core";
import { UIDocumentSettings } from "./ui-document-settings";
import { UISystem } from "./ui-system";

export enum RenderMode {
    OVERLAY,
    CAMERA,
    WORLD_SPACE,
}

export class UIRuntimeDocumentSettings extends UIDocumentSettings {

    private _camera: CameraComponent | null = null;

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

    get lowLevelRenderCamera () {
        return this._renderMode === RenderMode.OVERLAY ? UISystem.instance.hudCamera: this._camera?.camera;
    }

    private _renderMode = RenderMode.OVERLAY;
}