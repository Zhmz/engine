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

import { Vec2 } from '../../core/math/vec2';
import { ValueType } from '../../core/value-types';

export class Anchors extends ValueType {
    static ZERO = Object.freeze(new Anchors());

    private _min: Vec2;
    private _max: Vec2;

    get min (): Readonly<Vec2> {
        return this._min;
    }

    set min (val: Readonly<Vec2>) {
        this._min.set(val);
    }

    get max (): Readonly<Vec2> {
        return this._max;
    }

    set max (val: Readonly<Vec2>) {
        this._max.set(val);
    }

    constructor ();
    constructor (horizontal: number, vertical: number);
    constructor (minX: number, minY: number, maxX: number, maxY: number);
    constructor (arg1?: number, arg2?: number, arg3?: number, arg4?: number) {
        super();
        if (arg3 !== undefined) {
            this._min = new Vec2(arg1, arg2);
            this._max = new Vec2(arg3, arg4);
        } else if (arg2 !== undefined) {
            this._min = new Vec2(arg1, arg2);
            this._max = new Vec2(arg1, arg2);
        } else if (arg1 !== undefined) {
            this._min = new Vec2(arg1, arg1);
            this._max = new Vec2(arg1, arg1);
        } else {
            this._min = new Vec2();
            this._max = new Vec2();
        }
    }

    public clone () {
        return new Anchors(this._min.x, this._min.y, this._max.x, this._max.y);
    }

    public set (other: Anchors): void {
        this._min.set(other._min);
        this._max.set(other._max);
    }

    public equals (other: Anchors): boolean {
        return this._min.equals(other._min) && this._max.equals(other._max);
    }
}
