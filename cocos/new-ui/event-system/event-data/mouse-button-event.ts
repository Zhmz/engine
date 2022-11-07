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

import { Ray } from "../../../core/geometry";
import { Event } from "../../../input/types";

export enum FramePressState {
    PRESSED,
    RELEASED,
    PRESSED_AND_RELEASED,
    NOT_CHANGED,
}

export enum InputMouseButton {
    LEFT,
    RIGHT,
    MIDDLE,
}

export class MouseButtonEvent {

    protected _mouseButton: InputMouseButton = InputMouseButton.LEFT;
    protected _pressState: FramePressState = FramePressState.NOT_CHANGED;
    //protected _uiEvent: UIEvent | null = null;
    protected _event: Event | null = null;
    protected _ray: Ray | null = null;


    constructor(mouseButton: InputMouseButton) {
        this._mouseButton = mouseButton;
    }

    get mouseButton() {
        return this._mouseButton;
    }
    set mouseButton(val: InputMouseButton) {
        this._mouseButton = val;
    }

    get pressState() {
        return this._pressState;
    }
    set pressState(val: FramePressState) {
        this._pressState = val;
    }

    // get uiEvent(): UIEvent | null {
    //     return this._uiEvent;
    // }
    // set uiEvent(val: UIEvent | null) {
    //     this._uiEvent = val;
    // }

    get event(): Event | null {
        return this._event;
    }
    set event(val: Event | null) {
        this._event = val;
    }

    get ray(): Ray | null {
        return this._ray;
    }
    set ray(val: Ray | null) {
        this._ray = val;
    }

    public pressedThisFrame() {
        return this._pressState === FramePressState.PRESSED || this._pressState === FramePressState.PRESSED_AND_RELEASED;
    }

    public releasedThisFrame() {
        return this._pressState === FramePressState.RELEASED || this._pressState === FramePressState.PRESSED_AND_RELEASED;
    }
}

