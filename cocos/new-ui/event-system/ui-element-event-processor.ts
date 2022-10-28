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

import { Vec2 } from "../../core";
import { CallbacksInvoker } from "../../core/event/callbacks-invoker";
import { DispatcherEventType } from "../../core/scene-graph/node-event-processor";
import { Event, EventMouse, EventTouch, Touch } from '../../input/types';
import { NewUIEventType, SystemEventTypeUnion } from "../../input/types/event-enum";
import { UIElement } from "../base/ui-element";


const _touchEvents = [
    NewUIEventType.TOUCH_START,
    NewUIEventType.TOUCH_MOVE,
    NewUIEventType.TOUCH_END,
    NewUIEventType.TOUCH_CANCEL,
];

const _mouseEvents = [
    NewUIEventType.MOUSE_DOWN,
    NewUIEventType.MOUSE_ENTER,
    NewUIEventType.MOUSE_MOVE,
    NewUIEventType.MOUSE_LEAVE,
    NewUIEventType.MOUSE_UP,
    NewUIEventType.MOUSE_WHEEL,
];

let _currentHovered: UIElement | null = null;
const pos: Vec2 = new Vec2();

export class UIElementEventProcessor {
    private declare _uiElement:UIElement;
   
        /**
     * @internal
     */
         public static callbacksInvoker = new CallbacksInvoker<DispatcherEventType>();

    /**
     * Whether the node has registered the mouse event callback
     */
    public shouldHandleEventMouse = false;
    /**
     * Whether the node has registered the touch event callback
     */
    public shouldHandleEventTouch = false;

    /**
     * Target in bubbling phase.
     */
    public bubblingTarget: CallbacksInvoker<SystemEventTypeUnion> | null = null;

    /**
     * Target in capturing phase.
     */
    public capturingTarget: CallbacksInvoker<SystemEventTypeUnion> | null = null;

    /**
     * The list of claimed touch ids
     */
    public claimedTouchIdList: number[] = [];

    /**
     * To record whether the mouse move in at the previous mouse event.
     */
    public previousMouseIn = false;

    // Whether dispatch cancel event when node is destroyed.
    private _dispatchingTouch: Touch | null = null;



    constructor(uiElement:UIElement) {
        this._uiElement = uiElement;
    }

    get uiElement () {
        return this._uiElement;
    }

    public destroy(): void {
        // if (_currentHovered === this._node) {
        //     _currentHovered = null;
        // }

        if (this.capturingTarget) this.capturingTarget.clear();
        if (this.bubblingTarget) this.bubblingTarget.clear();
        UIElementEventProcessor.callbacksInvoker.emit(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this);
        if (this._dispatchingTouch) {
            // Dispatch touch cancel event when node is destroyed.
            const cancelEvent = new EventTouch([this._dispatchingTouch], true, NewUIEventType.TOUCH_CANCEL);
            cancelEvent.touch = this._dispatchingTouch;
            this.emitEvent(cancelEvent);
            this._dispatchingTouch = null;
        }
    }


    //从pointerInputModule转移一部分逻辑

    //#region register
    /**
        * Fix when reigster 'once' event callback, `this.off` method isn't be invoked after event is emitted.
        * We need to inject some uIElementEventProcessor's logic into the `callbacksInvoker.off` method.
        * @returns {CallbacksInvoker<SystemEventTypeUnion>} decorated callbacks invoker
        */
     private _newCallbacksInvoker(): CallbacksInvoker<SystemEventTypeUnion> {
        const callbacksInvoker = new CallbacksInvoker<SystemEventTypeUnion>();
        // @ts-expect-error Property '_registerOffCallback' is private
        callbacksInvoker._registerOffCallback(() => {
            if (this.shouldHandleEventTouch && !this._hasTouchListeners()) {
                this.shouldHandleEventTouch = false;
            }
            if (this.shouldHandleEventMouse && !this._hasMouseListeners()) {
                this.shouldHandleEventMouse = false;
            }
            if (!this._hasPointerListeners()) {
                //UIElementEventProcessor.callbacksInvoker.emit(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this);
            }
        });
        return callbacksInvoker;
    }

    private _hasPointerListeners() {
        const has = this._hasTouchListeners();
        if (has) {
            return true;
        }
        return this._hasMouseListeners();
    }


    private _hasTouchListeners() {
        for (let i = 0; i < _touchEvents.length; ++i) {
            const eventType = _touchEvents[i];
            if (this.hasEventListener(eventType)) {
                return true;
            }
        }
        return false;
    }

    private _hasMouseListeners() {
        for (let i = 0; i < _mouseEvents.length; ++i) {
            const eventType = _mouseEvents[i];
            if (this.hasEventListener(eventType)) {
                return true;
            }
        }
        return false;
    }

    public hasEventListener(type: SystemEventTypeUnion, callback?: Function, target?: unknown) {
        let has = false;
        if (this.bubblingTarget) {
            has = this.bubblingTarget.hasEventListener(type, callback, target);
        }
        if (!has && this.capturingTarget) {
            has = this.capturingTarget.hasEventListener(type, callback, target);
        }
        return has;
    }


    //先用newUIEventType，等会一起换为newUIEventType
    public on(type: NewUIEventType, callback: Function, target?: unknown, useCapture?: boolean) {
        this._tryEmittingAddEvent(type);
        useCapture = !!useCapture;
        let invoker: CallbacksInvoker<SystemEventTypeUnion>;
        if (useCapture) {
            invoker = this.capturingTarget ??= this._newCallbacksInvoker();
        } else {
            invoker = this.bubblingTarget ??= this._newCallbacksInvoker();
        }
        invoker.on(type, callback, target);
        return callback;
    }

    public once(type: NewUIEventType, callback: Function, target?: unknown, useCapture?: boolean) {
        this._tryEmittingAddEvent(type);
        useCapture = !!useCapture;
        let invoker: CallbacksInvoker<SystemEventTypeUnion>;
        if (useCapture) {
            invoker = this.capturingTarget ??= this._newCallbacksInvoker();
        } else {
            invoker = this.bubblingTarget ??= this._newCallbacksInvoker();
        }

        invoker.on(type, callback, target, true);
        return callback;
    }

    public off(type: NewUIEventType, callback?: Function, target?: unknown, useCapture?: boolean) {
        useCapture = !!useCapture;
        let invoker: CallbacksInvoker<SystemEventTypeUnion> | null;
        if (useCapture) {
            invoker = this.capturingTarget;
        } else {
            invoker = this.bubblingTarget;
        }
        invoker?.off(type, callback, target);
    }

    public targetOff(target: unknown) {
        this.capturingTarget?.removeAll(target);
        this.bubblingTarget?.removeAll(target);

        // emit event
        if (this.shouldHandleEventTouch && !this._hasTouchListeners()) {
            this.shouldHandleEventTouch = false;
        }
        if (this.shouldHandleEventMouse && !this._hasMouseListeners()) {
            this.shouldHandleEventMouse = false;
        }
        if (!this._hasPointerListeners()) {
            UIElementEventProcessor.callbacksInvoker.emit(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this);
        }
    }

    private _tryEmittingAddEvent(typeToAdd: NewUIEventType) {
        const isTouchEvent = this._isTouchEvent(typeToAdd);
        const isMouseEvent = this._isMouseEvent(typeToAdd);
        if (isTouchEvent) {
            this.shouldHandleEventTouch = true;
        } else if (isMouseEvent) {
            this.shouldHandleEventMouse = true;
        }
        if ((isTouchEvent || isMouseEvent) && !this._hasPointerListeners()) {
            UIElementEventProcessor.callbacksInvoker.emit(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this);
        }
    }

    private _isTouchEvent(type: NewUIEventType) {
        const index = _touchEvents.indexOf(type);
        return index !== -1;
    }

    private _isMouseEvent(type: NewUIEventType) {
        const index = _mouseEvents.indexOf(type);
        return index !== -1;
    }

    //#endregion register


    //#region dispatch



    public emitEvent(event: Event) {
        const owner = this._uiElement;
        let target: UIElement;
        let i = 0;
        event.target = owner;

        // Event.CAPTURING_PHASE
        //先不考虑capturing
        // _cachedArray.length = 0;
        // this.getCapturingTargets(event.type, _cachedArray);
        // // capturing
        // event.eventPhase = 1;
        // for (i = _cachedArray.length - 1; i >= 0; --i) {
        //     target = _cachedArray[i];
        //     if (target.eventProcessor.capturingTarget) {
        //         event.currentTarget = target;
        //         // fire event
        //         target.eventProcessor.capturingTarget.emit(event.type, event, _cachedArray);
        //         // check if propagation stopped
        //         if (event.propagationStopped) {
        //             _cachedArray.length = 0;
        //             return;
        //         }
        //     }
        // }
        // _cachedArray.length = 0;

        // Event.AT_TARGET
        // checks if destroyed in capturing callbacks
        // event.eventPhase = 2;
        // event.currentTarget = owner;
        // if (this.capturingTarget) {
        //     this.capturingTarget.emit(event.type, event);
        // }
        if (/*!event.propagationImmediateStopped &&*/ this.bubblingTarget) {
            this.bubblingTarget.emit(event.type, event);
        }

        // if (!event.propagationStopped && event.bubbles) {
        //     // Event.BUBBLING_PHASE
        //     this.getBubblingTargets(event.type, _cachedArray);
        //     // propagate
        //     event.eventPhase = 3;
        //     for (i = 0; i < _cachedArray.length; ++i) {
        //         target = _cachedArray[i];
        //         if (target.eventProcessor.bubblingTarget) {
        //             event.currentTarget = target;
        //             // fire event
        //             target.eventProcessor.bubblingTarget.emit(event.type, event);
        //             // check if propagation stopped
        //             if (event.propagationStopped) {
        //                 _cachedArray.length = 0;
        //                 return;
        //             }
        //         }
        //     }
        // }
        // _cachedArray.length = 0;
    }
    //#endregion dispatch

    //#region handle event
    public _handleEventMouse(eventMouse: EventMouse): boolean {
        switch (eventMouse.type) {
            case NewUIEventType.MOUSE_DOWN:
                return this._handleMouseDown(eventMouse);
            case NewUIEventType.MOUSE_MOVE:
                return this._handleMouseMove(eventMouse);
            case NewUIEventType.MOUSE_UP:
                return this._handleMouseUp(eventMouse);
            case NewUIEventType.MOUSE_WHEEL:
                return this._handleMouseWheel(eventMouse);
            default:
                return false;
        }
    }

    private _handleMouseDown(event: EventMouse): boolean {
        const uiElement: UIElement =this._uiElement;
        if (!uiElement) {
            return false;
        }
        event.getLocation(pos);

        if (uiElement.hitTestByScreenPos(pos)) {
            event.type = NewUIEventType.MOUSE_DOWN;
            event.bubbles = true;
            this.emitEvent(event);
            event.propagationStopped = true;
            return true;
        }
        return false;
    }

    private _handleMouseMove(event: EventMouse): boolean {
        // const node = this._node;
        // if (!node || !node._uiProps.uiTransformComp) {
        //     return false;
        // }

        // event.getLocation(pos);

        // const hit = node._uiProps.uiTransformComp.hitTest(pos);
        // if (hit) {
        //     if (!this.previousMouseIn) {
        //         // Fix issue when hover node switched, previous hovered node won't get MOUSE_LEAVE notification
        //         if (_currentHovered && _currentHovered !== node) {
        //             event.type = NewUIEventType.MOUSE_LEAVE;
        //             _currentHovered.emitEvent(event);
        //             _currentHovered.eventProcessor.previousMouseIn = false;
        //         }
        //         _currentHovered = node;
        //         event.type = NewUIEventType.MOUSE_ENTER;
        //         node.emitEvent(event);
        //         this.previousMouseIn = true;
        //     }
        //     event.type = NewUIEventType.MOUSE_MOVE;
        //     event.bubbles = true;
        //     node.emitEvent(event);
        //     event.propagationStopped = true;
        //     return true;
        // } else if (this.previousMouseIn) {
        //     event.type = NewUIEventType.MOUSE_LEAVE;
        //     node.emitEvent(event);
        //     this.previousMouseIn = false;
        //     _currentHovered = null;
        // }
        return false;
    }

    private _handleMouseUp(event: EventMouse): boolean {
        // const node = this._node;
        // if (!node || !node._uiProps.uiTransformComp) {
        //     return false;
        // }

        const uiElement: UIElement = this._uiElement;
        if (!uiElement) {
            return false;
        }
        event.getLocation(pos);

        if (uiElement.hitTestByScreenPos(pos)) {
            event.type = NewUIEventType.MOUSE_UP;
            event.bubbles = true;
            this.emitEvent(event);
            event.propagationStopped = true;
            return true;
        }
        return false;
    }

    private _handleMouseWheel(event: EventMouse): boolean {
        // const node = this._node;
        // if (!node || !node._uiProps.uiTransformComp) {
        //     return false;
        // }

        // event.getLocation(pos);

        // if (node._uiProps.uiTransformComp.hitTest(pos)) {
        //     event.type = NewUIEventType.MOUSE_WHEEL;
        //     event.bubbles = true;
        //     node.emitEvent(event);
        //     // event.propagationStopped = true;
        //     event.propagationStopped = true;
        //     return true;
        // }
        return false;
    }

    public _handleEventTouch(eventTouch: EventTouch) {
        switch (eventTouch.type) {
            case NewUIEventType.TOUCH_START:
                return this._handleTouchStart(eventTouch);
            case NewUIEventType.TOUCH_MOVE:
                return this._handleTouchMove(eventTouch);
            case NewUIEventType.TOUCH_END:
                return this._handleTouchEnd(eventTouch);
            case NewUIEventType.TOUCH_CANCEL:
                return this._handleTouchCancel(eventTouch);
            default:
                return false;
        }
    }

    private _handleTouchStart(event: EventTouch) {
        const uiElement: UIElement =this._uiElement;
        if (!uiElement) {
            return false;
        }
        event.getLocation(pos);

        if (uiElement.hitTestByScreenPos(pos)) {
            event.type = NewUIEventType.TOUCH_START;
            event.bubbles = true;
            this._dispatchingTouch = event.touch;
            this.emitEvent(event);
            return true;
        }

        return false;
    }

    private _handleTouchMove(event: EventTouch) {
        // const node = this.node;
        // if (!node || !node._uiProps.uiTransformComp) {
        //     return false;
        // }

        // event.type = NewUIEventType.TOUCH_MOVE;
        // event.bubbles = true;
        // this._dispatchingTouch = event.touch;
        // node.emitEvent(event);
        return true;
    }

    private _handleTouchEnd(event: EventTouch) {
        const uiElement: UIElement =this._uiElement;
        if (!uiElement) {
            return false;
        }
        event.getLocation(pos);

        if (uiElement.hitTestByScreenPos(pos)) {
            event.type = NewUIEventType.TOUCH_END;
        } else {
            event.type = NewUIEventType.TOUCH_CANCEL;
        }
        event.bubbles = true;
        this.emitEvent(event);
        this._dispatchingTouch = null;
    }

    private _handleTouchCancel(event: EventTouch) {
        // const node = this.node;
        // if (!node || !node._uiProps.uiTransformComp) {
        //     return;
        // }

        // event.type = NewUIEventType.TOUCH_CANCEL;
        // event.bubbles = true;
        //node.emitEvent(event);
    }

    //#endregion handle event


}














