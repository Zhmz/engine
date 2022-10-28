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
import { CallbacksInvoker } from '../../../core/event/callbacks-invoker';
import { DispatcherEventType, NodeEventProcessor } from '../../../core/scene-graph/node-event-processor';
import { input } from '../../../input';
import { Event, EventMouse, EventTouch, Touch } from '../../../input/types';
import { NewUIEventType, SystemEventTypeUnion } from '../../../input/types/event-enum';
import { UIElement } from '../../base/ui-element';
import { UIElementEventProcessor } from '../ui-element-event-processor';
import { BaseInputModule, InputModulePriority } from './base-input-module';


export class PointerInputModule extends BaseInputModule {
    public priority: InputModulePriority = InputModulePriority.UI;
    private _uiElementEventProcessorList: UIElementEventProcessor[] = [];
    private _processorListToAdd: UIElementEventProcessor[] = [];
    private _processorListToRemove: UIElementEventProcessor[] = [];

    //temporarily use this
    private uiElementProcessor: UIElementEventProcessor | null = null;

    constructor() {
        super();
        this.registerNodeEventProcessor();
    }

    private registerNodeEventProcessor() {
        UIElementEventProcessor.callbacksInvoker.on(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this.addNodeEventProcessor, this);
        UIElementEventProcessor.callbacksInvoker.on(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this.removeNodeEventProcessor, this);
    }




    public dispatchEventMouse(eventMouse: EventMouse): boolean {
        let dispatchToNextEventDispatcher = true;
        // const pos = Vec2.ZERO;
        // eventMouse.getLocation(pos);
        const succeed = this.uiElementProcessor!._handleEventMouse(eventMouse);//uiElement.hitTest(ray);//consider how to get the uiElement param

        //TODO: prevent event broadcasting
        if (succeed) {
            dispatchToNextEventDispatcher = false;
        }
        return dispatchToNextEventDispatcher;
    }

    // simulate click
    public dispatchEventTouch(eventTouch: EventTouch): boolean {
        let dispatchToNextEventDispatcher = true;
        const touch = eventTouch.touch!;
        if (this.uiElementProcessor!.shouldHandleEventTouch) {
            if (eventTouch.type === NewUIEventType.TOUCH_START) {
                if (this.uiElementProcessor!._handleEventTouch(eventTouch)) {
                    this.uiElementProcessor!.claimedTouchIdList.push(touch.getID());
                    dispatchToNextEventDispatcher = false;
                    if (eventTouch.preventSwallow) {
                        eventTouch.preventSwallow = false;  // reset swallow state
                    }
                }
            } else if (this.uiElementProcessor!.claimedTouchIdList.length > 0) {
                const index = this.uiElementProcessor!.claimedTouchIdList.indexOf(touch.getID());
                if (index !== -1) {
                    this.uiElementProcessor!._handleEventTouch(eventTouch);
                    if (eventTouch.type === NewUIEventType.TOUCH_END || eventTouch.type === NewUIEventType.TOUCH_CANCEL) {
                        js.array.removeAt(this.uiElementProcessor!.claimedTouchIdList, index);
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

    protected addNodeEventProcessor(processor: UIElementEventProcessor) {
        //TODO: use list to manage NodeEventProcessor
        if (!this.uiElementProcessor) {
            this.uiElementProcessor = processor;
        }
    }

    protected removeNodeEventProcessor(processor: UIElementEventProcessor) {
        //TODO: use list to manage NodeEventProcessor
        if (this.uiElementProcessor === processor) {
            this.uiElementProcessor = null;
        }
    }

}
