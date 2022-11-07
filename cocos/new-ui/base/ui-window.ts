  
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

import { UIDocument } from "./ui-document";
import { ContentControl } from "../framework/content-control";
import { Mat4 } from "../../core/math/mat4";
import { ErrorID, UIError } from "./error";
export class UIWindow extends ContentControl {
    constructor (document: UIDocument) {
        super();
        this._document = document;
    }

    get isMeasureDirty () {
        return this._measureDirty;
    }

    get previousArrangeRect () {
        return this.document!.viewport;
    }

    setParent () {
        throw new UIError(ErrorID.INVALID_WINDOW_PARENT);
    }

    protected updateWorldTransform () {
        super.updateWorldTransform();
        Mat4.multiply(this._worldTransform, this.document!.origin, this._worldTransform);
    }
}