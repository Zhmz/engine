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
import { js, Vec2 } from '../../../core';
import { boolean } from '../../../core/data/decorators';
import { CallbacksInvoker } from '../../../core/event/callbacks-invoker';
import { Ray } from '../../../core/geometry';
import { DispatcherEventType, NodeEventProcessor } from '../../../core/scene-graph/node-event-processor';
import { input } from '../../../input';
import { Event, EventMouse, EventTouch, Touch } from '../../../input/types';
import { InputEventType, NewUIEventType, SystemEventTypeUnion } from '../../../input/types/event-enum';
import { UIElement } from '../../base/ui-element';
import { eventSystem } from '../event-system';
import { UIElementEventProcessor } from '../ui-element-event-processor';
import { BaseInputModule, InputModulePriority } from './base-input-module';

const pos: Vec2 = new Vec2();

export class PointerInputModule extends BaseInputModule {
    public priority: InputModulePriority = InputModulePriority.UI;
    private _uiElementEventProcessorList: UIElementEventProcessor[] = [];
    private _processorListToAdd: UIElementEventProcessor[] = [];
    private _processorListToRemove: UIElementEventProcessor[] = [];

    //temporarily use this
    private uiElementProcessor: UIElementEventProcessor | null = null;
    private _uiElement: UIElement | null = null;

    // #region event
    private _mouseInput = new MouseInputSource();
    private _ray: Ray | null = null;

    get mouseInput(): MouseInputSource {
        return this._mouseInput;
    }

    get ray(): Ray | null {
        return this._ray;
    }
    set ray(val: Ray | null) {
        this._ray = val;
    }

    constructor() {
        super();
        //this.registerNodeEventProcessor();

        this._registerEvent();
    }

    // register events(temporarily mouseEvent)
    private _registerEvent() {

        // TODO: touch


        this._mouseInput.on(InputEventType.MOUSE_UP, (event) => {
            this._emitEvent(event);
        });
        this._mouseInput.on(InputEventType.MOUSE_MOVE, (event) => {
            this._emitEvent(event);
        });
        this._mouseInput.on(InputEventType.MOUSE_DOWN, (event) => {
            this._emitEvent(event);
        });
        this._mouseInput.on(InputEventType.MOUSE_WHEEL, (event) => {
            this._emitEvent(event);
        });
    }


    // trigger events
    public _emitEvent(event: Event) {
        // for (let i = 0; i < this._inputModuleList.length; i++) {
        //     const inputModule  = this._inputModuleList[i];
        //     if (!inputModule.dispatchEvent(event)) {
        //         // events block
        //         break;
        //     }
        // }
        //交给eventSystem派发事件
        eventSystem.dispatchEvent(event, this._ray!);
    }




    // private registerNodeEventProcessor() {
    //     // UIElementEventProcessor.callbacksInvoker.on(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this.addNodeEventProcessor, this);
    //     // UIElementEventProcessor.callbacksInvoker.on(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this.removeNodeEventProcessor, this);
    //     UIElement.callbacksInvoker.on(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this.addElement, this);
    //     UIElement.callbacksInvoker.on(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this.removeElement, this);
    // }




    // public dispatchEventMouse(eventMouse: EventMouse): boolean {
    //     let dispatchToNextEventDispatcher = true;
    //     // const pos = Vec2.ZERO;
    //     // eventMouse.getLocation(pos);
    //     const succeed = this._handleEventMouse(eventMouse);//uiElement.hitTest(ray);//consider how to get the uiElement param

    //     //TODO: prevent event broadcasting
    //     if (succeed) {
    //         dispatchToNextEventDispatcher = false;
    //     }
    //     return dispatchToNextEventDispatcher;
    // }

    // public _handleEventMouse(eventMouse: EventMouse): boolean {
    //     switch (eventMouse.type) {
    //         case NewUIEventType.MOUSE_DOWN:
    //             return this._handleMouseDown(eventMouse);
    //         case NewUIEventType.MOUSE_MOVE:
    //             return this._handleMouseMove(eventMouse);
    //         case NewUIEventType.MOUSE_UP:
    //             return this._handleMouseUp(eventMouse);
    //         case NewUIEventType.MOUSE_WHEEL:
    //             return this._handleMouseWheel(eventMouse);
    //         default:
    //             return false;
    //     }
    // }

    // private _handleMouseDown(event: EventMouse): boolean {
    //     const uiElement: UIElement = this._uiElement!;
    //     if (!uiElement) {
    //         return false;
    //     }
    //     event.getLocation(pos);

    //     if (uiElement.hitTestByScreenPos(pos)) {
    //         event.type = NewUIEventType.MOUSE_DOWN;
    //         event.bubbles = true;
    //         uiElement.dispatchEvent(event);
    //         event.propagationStopped = true;
    //         return true;
    //     }
    //     return false;
    // }

    // private _handleMouseMove(event: EventMouse): boolean {
    //     // const node = this._node;
    //     // if (!node || !node._uiProps.uiTransformComp) {
    //     //     return false;
    //     // }

    //     // event.getLocation(pos);

    //     // const hit = node._uiProps.uiTransformComp.hitTest(pos);
    //     // if (hit) {
    //     //     if (!this.previousMouseIn) {
    //     //         // Fix issue when hover node switched, previous hovered node won't get MOUSE_LEAVE notification
    //     //         if (_currentHovered && _currentHovered !== node) {
    //     //             event.type = NewUIEventType.MOUSE_LEAVE;
    //     //             _currentHovered.emitEvent(event);
    //     //             _currentHovered.eventProcessor.previousMouseIn = false;
    //     //         }
    //     //         _currentHovered = node;
    //     //         event.type = NewUIEventType.MOUSE_ENTER;
    //     //         node.emitEvent(event);
    //     //         this.previousMouseIn = true;
    //     //     }
    //     //     event.type = NewUIEventType.MOUSE_MOVE;
    //     //     event.bubbles = true;
    //     //     node.emitEvent(event);
    //     //     event.propagationStopped = true;
    //     //     return true;
    //     // } else if (this.previousMouseIn) {
    //     //     event.type = NewUIEventType.MOUSE_LEAVE;
    //     //     node.emitEvent(event);
    //     //     this.previousMouseIn = false;
    //     //     _currentHovered = null;
    //     // }
    //     return false;
    // }

    // private _handleMouseUp(event: EventMouse): boolean {
    //     // const node = this._node;
    //     // if (!node || !node._uiProps.uiTransformComp) {
    //     //     return false;
    //     // }

    //     const uiElement: UIElement = this._uiElement!;
    //     if (!uiElement) {
    //         return false;
    //     }
    //     event.getLocation(pos);

    //     if (uiElement.hitTestByScreenPos(pos)) {
    //         event.type = NewUIEventType.MOUSE_UP;
    //         event.bubbles = true;
    //         uiElement.dispatchEvent(event);
    //         event.propagationStopped = true;
    //         return true;
    //     }
    //      return false;
    // }

    // private _handleMouseWheel(event: EventMouse): boolean {
    //     // const node = this._node;
    //     // if (!node || !node._uiProps.uiTransformComp) {
    //     //     return false;
    //     // }

    //     // event.getLocation(pos);

    //     // if (node._uiProps.uiTransformComp.hitTest(pos)) {
    //     //     event.type = NewUIEventType.MOUSE_WHEEL;
    //     //     event.bubbles = true;
    //     //     node.emitEvent(event);
    //     //     // event.propagationStopped = true;
    //     //     event.propagationStopped = true;
    //     //     return true;
    //     // }
    //     return false;
    // }

    // // simulate click
    // public dispatchEventTouch(eventTouch: EventTouch): boolean {
    //     let dispatchToNextEventDispatcher = true;
    //     // const touch = eventTouch.touch!;
    //     // if (this.uiElementProcessor!.shouldHandleEventTouch) {
    //     //     if (eventTouch.type === NewUIEventType.TOUCH_START) {
    //     //         if (this.uiElementProcessor!._handleEventTouch(eventTouch)) {
    //     //             this.uiElementProcessor!.claimedTouchIdList.push(touch.getID());
    //     //             dispatchToNextEventDispatcher = false;
    //     //             if (eventTouch.preventSwallow) {
    //     //                 eventTouch.preventSwallow = false;  // reset swallow state
    //     //             }
    //     //         }
    //     //     } else if (this.uiElementProcessor!.claimedTouchIdList.length > 0) {
    //     //         const index = this.uiElementProcessor!.claimedTouchIdList.indexOf(touch.getID());
    //     //         if (index !== -1) {
    //     //             this.uiElementProcessor!._handleEventTouch(eventTouch);
    //     //             if (eventTouch.type === NewUIEventType.TOUCH_END || eventTouch.type === NewUIEventType.TOUCH_CANCEL) {
    //     //                 js.array.removeAt(this.uiElementProcessor!.claimedTouchIdList, index);
    //     //             }
    //     //             dispatchToNextEventDispatcher = false;
    //     //             if (eventTouch.preventSwallow) {
    //     //                 eventTouch.preventSwallow = false;  // reset swallow state
    //     //             }
    //     //         }
    //     //     }
    //     // }

    //     return dispatchToNextEventDispatcher;
    // }

    // protected addNodeEventProcessor(processor: UIElementEventProcessor) {
    //     //TODO: use list to manage NodeEventProcessor
    //     if (!this.uiElementProcessor) {
    //         this.uiElementProcessor = processor;
    //     }
    // }

    // protected removeNodeEventProcessor(processor: UIElementEventProcessor) {
    //     //TODO: use list to manage NodeEventProcessor
    //     if (this.uiElementProcessor === processor) {
    //         this.uiElementProcessor = null;
    //     }
    // }


    // protected addElement(element: UIElement) {
    //     if (!this._uiElement) {
    //         this._uiElement = element;
    //     }
    // }

    // protected removeElement(element: UIElement) {
    //     if (this._uiElement === element) {
    //         this._uiElement = null;
    //     }
    // }
}
