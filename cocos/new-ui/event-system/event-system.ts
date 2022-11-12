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
import { UISystem } from '../ui-system';
import { UIWindow } from '../base/ui-window';
import { UIEvent as NewUIEvent } from '../base/ui-event';
import { PointerDownEvent, PointerUpEvent } from './event-data/pointer-event';
import { BaseInputModule } from './input-modules/base-input-module';
import { PointerInputModule } from './input-modules/pointer-input-module';
import { RaycastResult } from './raycast-result';
import { MouseState } from './event-data/mouse-state';
import { FramePressState, InputMouseButton, MouseButtonEvent } from './event-data/mouse-button-event';
import { EventSubSystem } from '../subsystem/event-sub-system';
import { assert } from '../../core';

export class EventSystem {
    private _inputModuleList: BaseInputModule[] = [];

    private _mouseState: MouseState = new MouseState();
    private _uiSystem: UISystem;
    private _pointerInputModule = new PointerInputModule(this);

    public get pointerInputModule () {
        return this._pointerInputModule;
    }

    constructor (uiSystem: UISystem) {
        this._uiSystem = uiSystem;
    }

    // event data

    // raycast all
    public raycastAll () {

    }

    public tick () {
        const eventMouseList = this._pointerInputModule.eventMouseList;
        const ray = this._pointerInputModule.ray!;

        for (let i = 0; i < eventMouseList.length; i++) {
            const eventMouse = eventMouseList[i];
            this.handleMouseEvent(eventMouse, ray);
        }
    }

    protected emitEvent (event: Event) {

    }

    //raycast comparer
    private static raycastComparer (left: RaycastResult, right: RaycastResult) {

    }

    public registerInputModule (inputModule: BaseInputModule) {
        this._inputModuleList.push(inputModule);
        this._inputModuleList.sort((a, b) => b.priority - a.priority);
    }

    public handleTouchEvent (event: Event, ray: Ray) {

    }

    public dispatchTouchEvent () {

    }

    public handleMouseEvent (event: Event, ray: Ray) {
        const eventMouse = event as EventMouse;
        const button = eventMouse.getButton();
        if (button < 0) {
            // the event might be move which is not handled with.
            return;
        }
        let curMouseButtonEvent: MouseButtonEvent | null = null;

        if (button === EventMouse.BUTTON_LEFT) {
            curMouseButtonEvent = this._mouseState.getButtonEventData(InputMouseButton.LEFT);
        } else if (button === EventMouse.BUTTON_RIGHT) {
            curMouseButtonEvent = this._mouseState.getButtonEventData(InputMouseButton.RIGHT);
        } else if (button === EventMouse.BUTTON_MIDDLE) {
            curMouseButtonEvent = this._mouseState.getButtonEventData(InputMouseButton.MIDDLE);
        }
        let pressState: FramePressState;
        if (eventMouse.type === InputEventType.MOUSE_DOWN) {
            pressState = FramePressState.PRESSED;
        } else if (eventMouse.type === InputEventType.MOUSE_UP) {
            if (curMouseButtonEvent!.pressState === FramePressState.PRESSED) {
                pressState = FramePressState.PRESSED_AND_RELEASED;
            } else {
                pressState = FramePressState.RELEASED;
            }
        } else {
            pressState = FramePressState.NOT_CHANGED;
        }

        this._mouseState.setButtonEventData(curMouseButtonEvent!.mouseButton, pressState, event, ray);

        //dispatch
        this.dispatchMouseEvent(curMouseButtonEvent!);
    }

    public dispatchMouseEvent (mouseButtonEvent: MouseButtonEvent) {
        if (!mouseButtonEvent) {
            return;
        }
        //dispatch to the relevant document
        const documents = this._uiSystem.documents;
        for (let i = 0; i < documents.length; i++) {
            const curDocument = documents[i];
            const eventSubSystem = curDocument.getSubSystem(EventSubSystem);
            assert(eventSubSystem);
            const success = eventSubSystem.dispatchMouseEvent(mouseButtonEvent);
            if (success) {
                return;
            }
        }
    }
}
