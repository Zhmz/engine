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

import { DispatcherEventType, NodeEventProcessor } from '../../../core/scene-graph/node-event-processor';
import { Input } from '../../../input';
import { Event, EventMouse, EventTouch } from '../../../input/types';
import { eventSystem, EventSystem } from '../event-system';
import { RaycastResult } from '../raycast-result';

export enum InputModulePriority {
    GLOBAL = 0,
    UI = 1,
}

const mouseEvents = [
    Input.EventType.MOUSE_DOWN,
    Input.EventType.MOUSE_MOVE,
    Input.EventType.MOUSE_UP,
    Input.EventType.MOUSE_WHEEL,
];
const touchEvents = [
    Input.EventType.TOUCH_START,
    Input.EventType.TOUCH_MOVE,
    Input.EventType.TOUCH_END,
    Input.EventType.TOUCH_CANCEL,
];

export abstract class BaseInputModule {
    public abstract priority:InputModulePriority;

    //private declare _baseEventData:BaseEventData;

    // consider event block later
    //protected _nodeEventProcessorList:NodeEventProcessor[] = [];
    //protected declare _nodeEventProcessor:NodeEventProcessor|null;

    protected cacheRaycastResults:RaycastResult[] = [];

    // input

    constructor () {
        eventSystem.registerInputModule(this);

        // NodeEventProcessor.callbacksInvoker.on(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this.addNodeEventProcessor, this);
        // NodeEventProcessor.callbacksInvoker.on(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this.removeNodeEventProcessor, this);
        // //TODO： mark dirty
    }

    // public dispatchEvent (event:Event) :boolean {
    //     const eventType = event.type as Input.EventType;
    //     if (touchEvents.includes(eventType)) {
    //         return this.dispatchEventTouch(event as EventTouch);
    //     } else if (mouseEvents.includes(eventType)) {
    //         return  this.dispatchEventMouse(event as EventMouse);
    //     }
    //     return true;
    // }

    // public abstract dispatchEventMouse (eventMouse:EventMouse):boolean;
    // public abstract dispatchEventTouch (eventTouch:EventTouch):boolean;


}
