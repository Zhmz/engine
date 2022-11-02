  
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

import { UIElement } from "../base/ui-element";
import { UISubSystem } from "../base/ui-subsystem";

export class UILayoutSubsystem extends UISubSystem {
    private _buffer1 = new Array<UIElement>();
    private _buffer2 = new Array<UIElement>();
    private _doubleArray = [this._buffer1, this._buffer2];
    private _loop = 0;

    private _dirtyArrangeElements = this._buffer1;

    invalidate(element: UIElement) {
        this._dirtyArrangeElements.push(element);
    }

    update () {
        while (this.document.window.isMeasureDirty || this._dirtyArrangeElements.length > 0) {
            const dirtyArrangeElements = this._dirtyArrangeElements;
            this.sealDirtyElements();

            while (this.document.window.isMeasureDirty) {
                this.document.window.measure();
            }

            dirtyArrangeElements.sort(this.compareArrangeElement);
            
            for (let i = 0; i < dirtyArrangeElements.length; i++) {
                const uiElement = dirtyArrangeElements[i];
                uiElement.arrange(uiElement.previousArrangeRect);
            }
            dirtyArrangeElements.length = 0;
        }
    }

    private sealDirtyElements () {
        this._loop++
        this._dirtyArrangeElements = this._doubleArray[this._loop % 2];
    }

    private compareArrangeElement (elementA: UIElement, elementB: UIElement) {
        return elementA.hierarchyLevel - elementB.hierarchyLevel;
    }
}