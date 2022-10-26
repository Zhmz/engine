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

import { NodeEventType } from "../../core";
import { UIComponent } from "../base/ui-component";
import { UIElement } from "../base/ui-element";



export class UIButton extends UIComponent {
    protected declare _uiElement: UIElement;


    public static MOUSE_UP_COUNTER = 0;
    public static MOUSE_DOWN_COUNTER =0;

    constructor() {
        super();
        UIButton.MOUSE_DOWN_COUNTER = 0;
        UIButton.MOUSE_UP_COUNTER = 0;
    }

    protected _registerEvent() {
        this.node.on(NodeEventType.TOUCH_START, this._onTouchBegan, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(NodeEventType.TOUCH_END, this._onTouchEnded, this);
        this.node.on(NodeEventType.TOUCH_CANCEL, this._onTouchCancel, this);

        this.node.on(NodeEventType.MOUSE_ENTER, this._onMouseMoveIn, this);
        this.node.on(NodeEventType.MOUSE_LEAVE, this._onMouseMoveOut, this);
        this.node.on(NodeEventType.MOUSE_UP, this._onMouseUp, this);
        this.node.on(NodeEventType.MOUSE_DOWN, this._onMouseDown, this);
    }

    protected _unregisterEvent() {
        this.node.off(NodeEventType.TOUCH_START, this._onTouchBegan, this);
        this.node.off(NodeEventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(NodeEventType.TOUCH_END, this._onTouchEnded, this);
        this.node.off(NodeEventType.TOUCH_CANCEL, this._onTouchCancel, this);

        this.node.off(NodeEventType.MOUSE_ENTER, this._onMouseMoveIn, this);
        this.node.off(NodeEventType.MOUSE_LEAVE, this._onMouseMoveOut, this);
        this.node.on(NodeEventType.MOUSE_UP, this._onMouseUp, this);
        this.node.on(NodeEventType.MOUSE_DOWN, this._onMouseDown, this);
    }

    protected _onTouchBegan() {
        console.log('_onTouchBegan');
    }

    protected _onTouchMove() {
        console.log('_onTouchMove');
    }

    protected _onTouchEnded() {
        console.log('_onTouchEnded');
    }

    protected _onTouchCancel() {
        console.log('_onTouchCancel');
    }

    protected _onMouseMoveIn() {
        //TODO: button's reaction
        console.log('_onMouseMoveIn');
    }

    protected _onMouseMoveOut() {
        //TODO: button's reaction
        console.log('_onMouseMoveOut');
    }
    protected _onMouseDown() {
        console.log('_onMouseDown');
        UIButton.MOUSE_DOWN_COUNTER++;
    }

    protected _onMouseUp() {
        console.log('_onMouseUp');
        UIButton.MOUSE_UP_COUNTER++;
    }


}