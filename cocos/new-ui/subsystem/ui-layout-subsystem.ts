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

import { ErrorID, UIError } from '../base/error';
import { InvalidateReason, UIElement } from '../base/ui-element';
import { UISubSystem } from '../base/ui-subsystem';

export class UILayoutSubsystem extends UISubSystem {
    private _measureDirtyElements = new Set<UIElement>();
    private _arrangeDirtyElements = new Set<UIElement>();

    invalidate (element: UIElement, invalidateReason: InvalidateReason) {
        if (invalidateReason & InvalidateReason.ARRANGE) {
            this._arrangeDirtyElements.add(element);
        }
        if (invalidateReason & InvalidateReason.MEASURE) {
            this._measureDirtyElements.add(element);
        }
    }

    removeInvalidation (element: UIElement, invalidateReason: InvalidateReason) {
        if (invalidateReason & InvalidateReason.ARRANGE) {
            this._arrangeDirtyElements.delete(element);
        }

        if (invalidateReason & InvalidateReason.MEASURE) {
            this._measureDirtyElements.delete(element);
        }
    }

    update () {
        let iteration = 0;
        while (this._arrangeDirtyElements.size > 0 || this._measureDirtyElements.size > 0) {
            while (this._measureDirtyElements.size > 0) {
                const dirtyElement = this.getBottomMostElement(this._measureDirtyElements);
                dirtyElement.measure();
            }

            while (this._arrangeDirtyElements.size > 0) {
                const dirtyElement = this.getTopMostElement(this._arrangeDirtyElements);
                dirtyElement.arrange(dirtyElement.previousArrangeRect);
            }
            iteration++;
            if (iteration === 5) {
                throw new UIError(ErrorID.MAX_LAYOUT_ITERATION_COUNT);
            }
        }
    }

    private getBottomMostElement (elements: Set<UIElement>) {
        let level = -1;
        let bottomElement: UIElement | null = null;
        for (const element of elements) {
            if (element.hierarchyLevel > level) {
                bottomElement = element;
                level = element.hierarchyLevel;
            }
        }
        return bottomElement as UIElement;
    }

    private getTopMostElement (elements: Set<UIElement>) {
        let level = Number.MAX_VALUE;
        let topElement: UIElement | null = null;
        for (const element of elements) {
            if (element.hierarchyLevel < level) {
                topElement = element;
                level = element.hierarchyLevel;
            }
        }
        return topElement as UIElement;
    }
}
