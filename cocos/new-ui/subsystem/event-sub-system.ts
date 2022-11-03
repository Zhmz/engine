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

import { Ray } from "../../core/geometry";
import { InputEventType } from "../../input/types/event-enum";
import { UIElement } from "../base/ui-element";
import { UISubSystem } from "../base/ui-subsystem";
import { Event as NewUIEvent } from "../event-system/event-data/event";
import { PointerDownEvent } from "../event-system/event-data/pointer-down-event";
import { PointerUpEvent } from "../event-system/event-data/pointer-up-event";


export class EventSubSystem extends UISubSystem {
    get window() {
        return this._document.window;
    }

    invalidate(element: UIElement, dirtyFlags: number) {
    }

    update() {
    }
    
    protected getHitUIElement(ray: Ray): UIElement | null {
        const children: ReadonlyArray<UIElement> = this.window.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const hit = child.hitTest(ray);
            if (hit) {
                return child;
            }
        }
        return null;
    }

    public dispatchTouchEvent(event: Event, ray: Ray) {
        const element = this.getHitUIElement(ray);
        if (!element) {
            return;
        }

        // handle various touch events
    }


    public dispatchMouseEvent(event: Event, ray: Ray) {
        const element = this.getHitUIElement(ray);
        if (!element) {
            return;
        }

        let newUIEvent: NewUIEvent | null = null;
        switch (event.type) {
            case InputEventType.MOUSE_DOWN:
                newUIEvent = new PointerDownEvent();
                break;
            case InputEventType.MOUSE_UP:
                newUIEvent = new PointerUpEvent();
                break;
        }
        element.dispatchEvent(newUIEvent!);
    }

}

