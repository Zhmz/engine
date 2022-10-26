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

//import { MouseInputSource } from 'pal/input';
import { MouseInputSource } from '../../../pal/input/web';
import { Event, EventMouse } from '../../input/types';
import { InputEventType } from '../../input/types/event-enum';
import { UIElement } from '../base/ui-element';
import { BaseInputModule } from './input-modules/base-input-module';
import { RaycastResult } from './raycast-result';

export class EventSystem {
    private _inputModuleList: BaseInputModule[] = [];
    private _currInputModule: BaseInputModule | null = null;

    // #region event
    private _mouseInput = new MouseInputSource();

    private _eventMouseList :EventMouse[] = [];

    // #endregion

    // current event-applied UIElement
    private _currSelectedUIElement: UIElement | null = null;

    // the threshold of dragging
    private _dragPixelThreshold = 10;


    get mouseInput():MouseInputSource {
        return this._mouseInput;
    }

    get currInputModule (): BaseInputModule | null {
        return this._currInputModule;
    }
    set currInputModule (val: BaseInputModule | null) {
        this._currInputModule = val;
    }

    get currSelectedUIElement (): UIElement | null {
        return this._currSelectedUIElement;
    }
    set currSelectedUIElement (val: UIElement | null) {
        this._currSelectedUIElement = val;
    }

    get dragPixelThreshold ():number {
        return this._dragPixelThreshold;
    }
    set dragPixelThreshold (val:number) {
        this._dragPixelThreshold = val;
    }

    constructor () {
        this._registerEvent();
    }

    // update input modules
    public updateModules () {

    }

    // event data

    // raycast all
    public raycastAll () {

    }

    //raycast comparer
    private static raycastComparer (left: RaycastResult, right: RaycastResult) {

    }

    // trigger events
    public _emitEvent (event:Event) {
        for (let i = 0; i < this._inputModuleList.length; i++) {
            const inputModule  = this._inputModuleList[i];
            if (!inputModule.dispatchEvent(event)) {
                // events block
                break;
            }
        }
    }

    // register events(temporarily mouseEvent)
    private _registerEvent () {

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

    public registerInputModule (inputModule:BaseInputModule) {
        this._inputModuleList.push(inputModule);
        this._inputModuleList.sort((a, b) => b.priority - a.priority);
    }
}

export const eventSystem = new EventSystem();
