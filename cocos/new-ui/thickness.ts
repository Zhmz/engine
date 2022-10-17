  
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

import { ValueType } from "../core/value-types";

export class Thickness extends ValueType {
    private _left: number;
    private _right: number;
    private _top: number;
    private _bottom: number;

    get left () {
        return this._left;
    }

    set left (val: number) {
        this._left = val;
    }

    get right () {
        return this._right;
    }

    set right (val: number) {
        this._right = val;
    }

    get top () {
        return this._top;
    }

    set top (val: number) {
        this._top = val;
    }

    get bottom () {
        return this._bottom;
    }

    set bottom (val: number) {
        this._bottom = val;
    }

    constructor ();
    constructor (uniformLength: number);
    constructor (left: number, top: number, right: number, bottom: number);
    constructor (arg1?: number, arg2?: number, arg3?: number, arg4?: number) {
        super();
        if (arg2 !== undefined) {
            this._left = arg1 as number;
            this._top = arg2;
            this._right = arg3 as number;
            this._bottom = arg4 as number;
        } else if (arg1 !== undefined) {
            this._left = this._right = this._top = this._bottom = arg1;
        } else {
            this._left = this._right = this._top = this._bottom = 0;
        }
        
    }
}