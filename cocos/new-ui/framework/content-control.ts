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

import { Rect, Size } from "../../core";
import { UIElement, Visibility } from "../base/ui-element";
import { UISlot } from "../base/ui-slot";
import { ContentSlot, HorizontalAlignment, VerticalAlignment } from "./content-slot";

export class ContentElement extends UIElement {
    protected allowMultipleChild () {
        return false;
    }

    protected getSlotClass (): typeof UISlot | null{
        return ContentSlot;
    }

    public onMeasure () {
        const desiredSize = new Size();
        if (this.childCount > 0) {
            const child = this._children[0];
            child.measure();
            const { width: marginWidth, height: marginHeight } = child.margin;
            desiredSize.set(child.desiredSize.width + marginWidth, child.desiredSize.height + marginHeight);
        }
        return desiredSize;
    }

    public onArrange (finalRect: Rect) {
        if (this.childCount > 0) {
            const child = this._children[0];
            if (child.visibility !== Visibility.COLLAPSED) {
                const childRect = new Rect();
                const contentSlot = child.slot as ContentSlot;
                const { width: marginWidth, height: marginHeight } = child.margin;
                if (contentSlot.horizontalAlignment === HorizontalAlignment.STRETCH) {
                    childRect.width = finalRect.width;
                } else {
                    childRect.width = child.desiredSize.width + marginWidth;
                }

                if (contentSlot.verticalAlignment === VerticalAlignment.STRETCH) {
                    childRect.height = finalRect.height;
                } else {
                    childRect.height = child.desiredSize.height + marginHeight;
                }

                switch (contentSlot.horizontalAlignment) {
                    case HorizontalAlignment.LEFT:
                        childRect.x = (childRect.width - finalRect.width) / 2;
                        break;
                    case HorizontalAlignment.RIGHT:
                        childRect.x = (finalRect.width - childRect.width) / 2;
                }

                switch (contentSlot.verticalAlignment) {
                    case VerticalAlignment.TOP:
                        childRect.y = (childRect.height - finalRect.height) / 2;
                        break;
                    case VerticalAlignment.BOTTOM:
                        childRect.y = (finalRect.height - childRect.height) / 2;
                }
                child.arrange(childRect);
            }
        }
    }
}