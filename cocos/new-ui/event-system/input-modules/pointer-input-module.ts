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

import { js, Vec2 } from '../../../core';
import { boolean } from '../../../core/data/decorators';
import { DispatcherEventType, NodeEventProcessor } from '../../../core/scene-graph/node-event-processor';
import { input } from '../../../input';
import { EventMouse, EventTouch } from '../../../input/types';
import { InputEventType } from '../../../input/types/event-enum';
import { UIElement } from '../../base/ui-element';
import { BaseInputModule, InputModulePriority } from './base-input-module';

export class PointerInputModule extends BaseInputModule {
    public priority: InputModulePriority = InputModulePriority.UI;

    constructor() {
        super();

    }

    public registerNodeEventProcessor() {
        NodeEventProcessor.callbacksInvoker.on(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this.addNodeEventProcessor, this);
        NodeEventProcessor.callbacksInvoker.on(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this.removeNodeEventProcessor, this);
    }


    public dispatchEventMouse(eventMouse: EventMouse): boolean {
        let dispatchToNextEventDispatcher = true;
        // const pos = Vec2.ZERO;
        // eventMouse.getLocation(pos);
        const succeed = true;//uiElement.hitTest(ray);//consider how to get the uiElement param
        
        //TODO: prevent event broadcasting
        if (succeed) {
            this._nodeEventProcessor!.dispatchEvent(eventMouse);
            dispatchToNextEventDispatcher = false;
        }
        return dispatchToNextEventDispatcher;
    }

    // simulate click
    public dispatchEventTouch(eventTouch: EventTouch): boolean {
        let dispatchToNextEventDispatcher = true;
        const pointerEventProcessor = this._nodeEventProcessor!;
        const touch = eventTouch.touch!;
        if (pointerEventProcessor.isEnabled && pointerEventProcessor.shouldHandleEventTouch) {
            if (eventTouch.type === InputEventType.TOUCH_START) {
                // @ts-expect-error access private method
                if (pointerEventProcessor._handleEventTouch(eventTouch)) {
                    pointerEventProcessor.claimedTouchIdList.push(touch.getID());
                    dispatchToNextEventDispatcher = false;
                    if (eventTouch.preventSwallow) {
                        eventTouch.preventSwallow = false;  // reset swallow state
                    }
                }
            } else if (pointerEventProcessor.claimedTouchIdList.length > 0) {
                const index = pointerEventProcessor.claimedTouchIdList.indexOf(touch.getID());
                if (index !== -1) {
                    // @ts-expect-error access private method
                    pointerEventProcessor._handleEventTouch(eventTouch);
                    if (eventTouch.type === InputEventType.TOUCH_END || eventTouch.type === InputEventType.TOUCH_CANCEL) {
                        js.array.removeAt(pointerEventProcessor.claimedTouchIdList, index);
                    }
                    dispatchToNextEventDispatcher = false;
                    if (eventTouch.preventSwallow) {
                        eventTouch.preventSwallow = false;  // reset swallow state
                    }
                }
            }
        }

        return dispatchToNextEventDispatcher;
    }
}

export const pointerInputModule = new PointerInputModule();