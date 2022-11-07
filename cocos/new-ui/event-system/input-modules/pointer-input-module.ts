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

import { MouseInputSource } from '../../../../pal/input/web';
import { Vec2 } from '../../../core';
import { Ray } from '../../../core/geometry';
import { InputEventType } from '../../../input/types/event-enum';
import { BaseInputModule, InputModulePriority } from './base-input-module';
import { Event, EventMouse, EventTouch } from '../../../input/types';
import { UISystem } from '../../base/ui-system';
import { MouseState } from '../event-data/mouse-state';

const pos: Vec2 = new Vec2();

const mouseEvents = [
    InputEventType.MOUSE_DOWN,
    InputEventType.MOUSE_MOVE,
    InputEventType.MOUSE_UP,
    InputEventType.MOUSE_WHEEL,
];
const touchEvents = [
    InputEventType.TOUCH_START,
    InputEventType.TOUCH_MOVE,
    InputEventType.TOUCH_END,
    InputEventType.TOUCH_CANCEL,
];

export class PointerInputModule extends BaseInputModule {
    public priority: InputModulePriority = InputModulePriority.UI;

    // #region event
    private _mouseInput = new MouseInputSource();
    private _ray: Ray | null = null;

    private _eventTouchList: EventTouch[] = [];
    private _eventMouseList: EventMouse[] = [];

    private _dispatchImmediately: boolean = true;

    get mouseInput(): MouseInputSource {
        return this._mouseInput;
    }

    get ray(): Ray | null {
        return this._ray;
    }
    set ray(val: Ray | null) {
        this._ray = val;
    }

    get eventTouchList() {
        return this._eventTouchList;
    }

    get eventMouseList() {
        return this._eventMouseList;
    }

    constructor() {
        super();
        this._registerEvent();
        this._ray = new Ray();
    }

    private _registerEvent() {
        // TODO: touch


        this._mouseInput.on(InputEventType.MOUSE_UP, (event) => {
            this._dispatchOrPushEvent(event, this._eventMouseList);
        });
        this._mouseInput.on(InputEventType.MOUSE_MOVE, (event) => {
            this._dispatchOrPushEvent(event, this._eventMouseList);
        });
        this._mouseInput.on(InputEventType.MOUSE_DOWN, (event) => {
            this._dispatchOrPushEvent(event, this._eventMouseList);
        });
        this._mouseInput.on(InputEventType.MOUSE_WHEEL, (event) => {
            this._dispatchOrPushEvent(event, this._eventMouseList);
        });
    }

    protected _dispatchOrPushEvent(event: Event, eventList: Event[]) {
        // dispatch
        if (this._dispatchImmediately) {
            this._dispatchEvent(event, this._ray!);
        } else {
            eventList.push(event);
        }
    }

    protected _dispatchEvent(event: Event, ray: Ray) {
        const eventSystem = UISystem.instance.eventSystem;
        const eventType = event.type as InputEventType;
        if (touchEvents.includes(eventType)) {
            eventSystem.handleTouchEvent(event, ray);
        } else if (mouseEvents.includes(eventType)) {
            eventSystem.handleMouseEvent(event, ray);
        }
    }

    protected clearEvents() {
        this._eventMouseList.length = 0;
        this._eventTouchList.length = 0;
    }
}

export const pointerInputModule = new PointerInputModule();
