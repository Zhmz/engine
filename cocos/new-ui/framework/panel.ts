
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

import { ErrorID, UIError } from "../base/error";
import { ContainerElement } from "../base/container-element";
import { UIElement } from "../base/ui-element";

export class Panel extends ContainerElement {
    
    public insertChildAt (child: UIElement, index: number) {
        if (index < 0 || index > this._children.length - 1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        if (child.parent === this) {
            throw new UIError(ErrorID.INVALID_INPUT);
        }
        child.setParent(this);
        this.changeChildOrder(child, index);
    }

    public changeChildOrder (child: UIElement, index: number) {
        if (index < 0 || index > this._children.length - 1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        if (child.parent !== this) {
            throw new UIError(ErrorID.INVALID_INPUT);
        }
        const originIndex = this._children.indexOf(child);
        if (originIndex === index) { return; }
        this._children.splice(index, 0, child);
        if (originIndex > index) {
            this._children.splice(originIndex + 1, 1);
        } else {
            this._children.splice(originIndex, 1);
        }
    }
    
    public allowMultipleChild () {
        return true;
    }
}