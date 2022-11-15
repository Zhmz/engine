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

import { Ray } from '../../core/geometry';
import { InputEventType } from '../../input/types/event-enum';
import { InvalidateReason, UIElement } from '../base/ui-element';
import { UISubSystem } from '../base/ui-subsystem';
import { UIEvent } from '../base/ui-event';
import { PointerUpEvent, PointerDownEvent, PointerClickEvent } from '../event-system/event-data/pointer-event';
import { FramePressState, MouseButtonEvent } from '../event-system/event-data/mouse-button-event';
import { UIDocument, UISubSystemStage } from '../base/ui-document';
import { UIRuntimeDocumentSettings } from '../base';
import { RenderMode } from '../framework';
import { UISystem } from '../ui-system';
import { EventMouse } from '../../input/types';

export class EventSubSystem extends UISubSystem {
    get window () {
        return this._document.window;
    }

    get settings () {
        return this._document.settings as UIRuntimeDocumentSettings;
    }
    
    private get renderCamera () {
        switch (this.settings.renderMode) {
        case RenderMode.OVERLAY:
            return UISystem.instance.hudCamera;
        case RenderMode.CAMERA:
            return this.settings.camera?.camera;
        case RenderMode.WORLD_SPACE:
            return null;
        default:
            return null;
        }
    }

    protected getHitUIElement (ray: Ray): UIElement | null {
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

    // public dispatchTouchEvent(event: Event, ray: Ray) {
    //     const element = this.getHitUIElement(ray);
    //     if (!element) {
    //         return;
    //     }

    //     // handle various touch events
    // }

    public dispatchMouseEvent (mouseButtonEvent: MouseButtonEvent): boolean {
        if (!mouseButtonEvent) {
            return false;
        }

        let ray = mouseButtonEvent.ray;
        // The ray is not null in XR module
        if(!ray) {
            const eventMouse = mouseButtonEvent.event as EventMouse;
            const posX = eventMouse.getLocationX();
            const posY = eventMouse.getLocationY();
            ray = new Ray();
            this.renderCamera!.screenPointToRay(ray!,posX,posY);
        }

        const element = this.getHitUIElement(ray!);
        if (!element) {
            return false;
        }

        let uiEvent: UIEvent | null = null;
        // eslint-disable-next-line default-case
        switch (mouseButtonEvent.pressState) {
        case FramePressState.PRESSED:
            uiEvent = new PointerDownEvent(element);
            break;
        case FramePressState.RELEASED:
            uiEvent = new PointerUpEvent(element);
            break;
        case FramePressState.PRESSED_AND_RELEASED:
            uiEvent = new PointerClickEvent(element);
            break;
        }
        element.dispatchEvent(uiEvent!);
        return true;
    }
}

UIDocument.registerSubsystem(EventSubSystem, UISubSystemStage.EVENT);
