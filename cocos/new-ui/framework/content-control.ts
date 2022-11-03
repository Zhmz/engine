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

import { Rect, Size, Vec2 } from "../../core";
import { ContainerElement } from "../base/container-element";
import { UIElement, Visibility } from "../base/ui-element";
import { UISlot } from "../base/ui-slot";
import { ContentSlot, HorizontalAlignment, VerticalAlignment } from "./content-slot";
import { assertIsNonNullable } from "../../core/data/utils/asserts";

export class ContentControl extends ContainerElement {

    get content (): UIElement | null {
        return this.childCount > 0 ? this._children[0] : null;
    }

    set content (element: UIElement | null) {
        if (element) {
            this.addChild(element);
        } else {
            this.clearChildren();
        }
    }

    public addChild (element: UIElement) {
        this.clearChildren();
        super.addChild(element);
    }

    public allowMultipleChild () {
        return false;
    }

    public getSlotClass (): typeof UISlot {
        return ContentSlot;
    }

    protected computeDesiredSize () {
        const desiredSize = new Size();
        const content = this.content;
        if (content) {
            content.measure();
            const { width: marginWidth, height: marginHeight } = content.margin;
            desiredSize.set(content.desiredSize.width + marginWidth, content.desiredSize.height + marginHeight);
        }
        return desiredSize;
    }

    protected arrangeContent (finalRect: Rect) {
        const content = this.content;
        if (content) {
            if (content.visibility !== Visibility.COLLAPSED) {
                const childRect = new Rect();
                const contentSlot = content.slot as ContentSlot;
                assertIsNonNullable(contentSlot);
                const { width: marginWidth, height: marginHeight } = content.margin;
                if (contentSlot.horizontalAlignment === HorizontalAlignment.STRETCH) {
                    childRect.width = finalRect.width;
                } else {
                    childRect.width = content.desiredSize.width + marginWidth;
                }

                if (contentSlot.verticalAlignment === VerticalAlignment.STRETCH) {
                    childRect.height = finalRect.height;
                } else {
                    childRect.height = content.desiredSize.height + marginHeight;
                }

                childRect.center = new Vec2(0, 0);

                switch (contentSlot.horizontalAlignment) {
                    case HorizontalAlignment.LEFT:
                        childRect.x = -finalRect.width / 2;
                        break;
                    case HorizontalAlignment.RIGHT:
                        childRect.x = finalRect.width / 2 - childRect.width;
                        break;
                }

                switch (contentSlot.verticalAlignment) {
                    case VerticalAlignment.TOP:
                        childRect.y = finalRect.height / 2  - childRect.height;
                        break;
                    case VerticalAlignment.BOTTOM:
                        childRect.y = -finalRect.height / 2;
                        break;
                }
                content.arrange(childRect);
            }
        }
    }
}