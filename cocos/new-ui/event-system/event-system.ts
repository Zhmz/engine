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
import { Event, EventMouse } from '../../input/types';
import { InputEventType } from '../../input/types/event-enum';
import { UIDocument } from '../base/ui-document';
import { UIElement } from '../base/ui-element';
import { UIWindow } from '../base/ui-window';
import { Event as NewUIEvent } from './event-data/event';
import { PointerDownEvent } from './event-data/pointer-down-event';
import { PointerUpEvent } from './event-data/pointer-up-event';
import { BaseInputModule } from './input-modules/base-input-module';
import { pointerInputModule } from './input-modules/pointer-input-module';
import { RaycastResult } from './raycast-result';

export class EventSystem {
    private _inputModuleList: BaseInputModule[] = [];
    private _window: UIWindow | null = null;

    get window(): UIWindow | null {
        return this._window;
    }

    set window(val: UIWindow | null) {
        this._window = val;
    }

    constructor() {

    }

    // event data

    // raycast all
    public raycastAll() {

    }

    public tick(documents: UIDocument[]) {

        const eventMouseList = pointerInputModule.eventMouseList;

        for(let i = 0 ;i<eventMouseList.length;i++){
            const eventMouse  = eventMouseList[i];

        }


        for (let i = 0; i < documents.length; i++) {
            const curDocument = documents[i];




            //const children: ReadonlyArray<UIElement> = curDocument.window.children;
        }
    }

    protected emitEvent(event:Event) {

    }

    // protected getHitUIElement(ray: Ray): UIElement | null {
    //     const children: ReadonlyArray<UIElement> = this._window!.children;
    //     for (let i = 0; i < children.length; i++) {
    //         const child = children[i];
    //         const hit = child.hitTest(ray);
    //         if (hit) {
    //             return child;
    //         }
    //     }
    //     return null;
    // }

    // public dispatchTouchEvent(event: Event, ray: Ray) {
    //     const element = this.getHitUIElement(ray);
    //     if (!element) {
    //         return;
    //     }

    //     // handle various touch events
    // }


    // public dispatchMouseEvent(event: Event, ray: Ray) {
    //     const element = this.getHitUIElement(ray);
    //     if (!element) {
    //         return;
    //     }

    //     let newUIEvent: NewUIEvent | null = null;
    //     switch (event.type) {
    //         case InputEventType.MOUSE_DOWN:
    //             newUIEvent = new PointerDownEvent();
    //             break;
    //         case InputEventType.MOUSE_UP:
    //             newUIEvent = new PointerUpEvent();
    //             break;
    //     }
    //     element.dispatchEvent(newUIEvent!);
    // }

    //raycast comparer
    private static raycastComparer(left: RaycastResult, right: RaycastResult) {

    }

    public registerInputModule(inputModule: BaseInputModule) {
        this._inputModuleList.push(inputModule);
        this._inputModuleList.sort((a, b) => b.priority - a.priority);
    }
}