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

import { AdvancedObject } from './advanced-object';
import { AttachedObject } from './attached-object';

type Constructor<T = any> = new (...args) => T;

export enum Primitive {
    NUMBER,
    STRING,
    BOOLEAN,
}

export class AdvancedProperty {
    static UNSET_VALUE = undefined;

    private _name: string;
    // Object is used for Enum
    private _propertyType: Constructor | Record<string, number | string> | Primitive;
    private _ownerType: Constructor<AdvancedObject | AttachedObject>;
    private _defaultValue: any;
    private _id: number;
    private constructor (
        id: number,
        name: string,
        type: Constructor | Record<string, number | string> | Primitive,
        ownerType: Constructor<AdvancedObject | AttachedObject>,
        defaultValue: any,
    ) {
        this._id = id;
        this._name = name;
        this._propertyType = type;
        this._ownerType = ownerType;
        this._defaultValue = defaultValue;
    }

    private static _propertyRegistry = new Array<AdvancedProperty>();
    public static register<OT extends AdvancedObject | AttachedObject> (
        name: string,
        type: Constructor | Record<string, number | string> | Primitive,
        ownerType: Constructor<OT>,
        defaultValue: any = AdvancedProperty.UNSET_VALUE,
    ) {
        const ap = new AdvancedProperty(this._propertyRegistry.length, name, type, ownerType, defaultValue);
        this._propertyRegistry.push(ap);
        return ap;
    }

    public static get allRegisteredProperties (): ReadonlyArray<AdvancedProperty> {
        return this._propertyRegistry;
    }

    public static getRegisteredPropertiesForOwnerType<OT extends AdvancedObject | AttachedObject> (ownerType: Constructor<OT>) {
        return this._propertyRegistry.filter((val) => val.ownerType === ownerType);
    }

    public get name () { return this._name; }
    public get propertyType () { return this._propertyType; }
    public get ownerType () { return this._ownerType; }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    public get defaultValue () { return this._defaultValue; }
    public get id () { return this._id; }
}
