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

import { AdvancedProperty, Primitive } from './advanced-property';
import { Enum } from '../../core/value-types/enum';
import { Vec3 } from '../../core/math/vec3';
import { Vec2 } from '../../core/math/vec2';
import { Quat } from '../../core/math/quat';
import { assert } from '../../core/platform/debug';
import { ErrorID, UIError } from './error';
import { Thickness } from './thickness';
import { UISlot } from './ui-slot';
import { UIDocument } from './ui-document';
import { approx, Mat4, Pool, Rect, Size } from '../../core';
import { Ray } from '../../core/geometry';
import { UIElementEventProcessor } from '../event-system/ui-element-event-processor';
import { NewUIEventType } from '../../input/types/event-enum';
import { CallbackInfo, CallbackList, CallbacksInvoker, ICallbackTable } from '../../core/event/callbacks-invoker';
import { createMap } from '../../core/utils/js-typed';
import { DispatcherEventType } from '../../core/scene-graph/node-event-processor';
import { Event } from '../event-system/event-data/event';
import { PointerDownEvent } from '../event-system/event-data/pointer-down-event';
import { PointerUpEvent } from '../event-system/event-data/pointer-up-event';
import { ContainerElement } from './container-element';
import { Visual } from './visual';

export enum FlowDirection {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
}

export enum Visibility {
    VISIBLE,
    HIDDEN,
    COLLAPSED
}

export enum InvalidateReason {
    HIERARCHY = 1,
    MEASURE = 1 << 1,
    ARRANGE = 1 << 2,
    STYLE = 1 << 3,
    TRANSFORM = 1 << 4,
    PAINT = 1 << 5
}

const MAX_SIZE = 16;
const callbackListPool = new Pool<CallbackList>(() => new CallbackList(), MAX_SIZE);

const callbackInfoPool = new Pool(() => new CallbackInfo(), 32);

declare type Constructor<T = unknown> = new (...args: any[]) => T;


export class UIElement extends Visual {
    public static FlowDirectionProperty = AdvancedProperty.register('FlowDirection', Enum(FlowDirection), UIElement, FlowDirection.LEFT_TO_RIGHT);
    public static OpacityProperty = AdvancedProperty.register('Opacity', Primitive.NUMBER, UIElement, 1);
    public static VisibilityProperty = AdvancedProperty.register('Visibility', Enum(Visibility), UIElement, Visibility.VISIBLE);
    public static ClipToBoundsProperty = AdvancedProperty.register('ClipToBounds', Primitive.BOOLEAN, UIElement, true);
    public static PositionProperty = AdvancedProperty.register('Position', Vec3, UIElement, Vec3.ZERO);
    public static RotationProperty = AdvancedProperty.register('Rotation', Quat, UIElement, Quat.IDENTITY);
    public static ScaleProperty = AdvancedProperty.register('Scale', Vec3, UIElement, Vec3.ONE);
    public static ShearProperty = AdvancedProperty.register('Shear', Vec2, UIElement, Vec2.ZERO);
    public static RenderTransformPivotProperty = AdvancedProperty.register('RenderTransformPivot', Vec2, UIElement, Object.freeze(new Vec2(0.5, 0.5)));
    public static MarginProperty = AdvancedProperty.register('Margin', Thickness, UIElement, Thickness.ZERO);

    protected _slot: UISlot | null = null;
    protected _document: UIDocument | null = null;
    protected _parent: ContainerElement | null = null;
    protected _children: Array<UIElement> = [];
    protected _layout = new Rect();
    protected _desiredSize = new Size();
    protected _worldTransform = new Mat4();
    protected _localTransform = new Mat4();
    protected _worldTransformDirty = false;
    protected _localTransformDirty = false;

    constructor() {
        super();
        this._registerEvent();
    }

    //#region Layout

    protected _measureDirty = false;
    protected _arrangeDirty = false;

    get slot() {
        return this._slot;
    }

    get parent () {
        return this._parent;
    }

    get document () {
        return this._document;
    }

    //#region Layout

    get layout () {
        return this._layout;
    }

    set layout (val: Readonly<Rect>) {
        if (!this._layout.size.equals(val.size)) {
            this.invalidatePainting();
        }
        if (!this._layout.equals(val)) {
            this.invalidateWorldTransform();
            this._layout.set(val);
        }
    }


    get desiredSize (): Readonly<Size> {
        if (this.visibility === Visibility.COLLAPSED) {
            return Size.ZERO;
        }
        return this._desiredSize;
    }

    set desiredSize (val) {
        if (!this._desiredSize.equals(val)) {
            this._desiredSize.set(val);
            this.invalidateParentArrange();
        }
    }

    get margin () {
        return this.getValue(UIElement.MarginProperty) as Thickness;
    }

    set margin (val: Thickness) {
        this.invalidateParentMeasure();
        this.setValue(UIElement.MarginProperty, val);
    }

    get flowDirection() {
        return this.getValue(UIElement.FlowDirectionProperty) as FlowDirection;
    }


    set flowDirection (flowDirection: FlowDirection) {
        this.invalidateParentArrange();
        this.setValue(UIElement.FlowDirectionProperty, flowDirection);
    }
    //#endregion Layout

    //#region Display

    get opacity() {
        return this.getValue(UIElement.OpacityProperty) as number;
    }

    set opacity(val: number) {
        this.setValue(UIElement.OpacityProperty, val);
    }

    get visibility() {
        return this.getValue(UIElement.VisibilityProperty) as Visibility;
    }

    set visibility(val: Visibility) {
        this.setValue(UIElement.VisibilityProperty, val);
    }

    get clipToBounds() {
        return this.getValue(UIElement.ClipToBoundsProperty) as boolean;
    }

    set clipToBounds(val: boolean) {
        this.setValue(UIElement.ClipToBoundsProperty, val);
    }

    //#endregion Display

    //#region RenderTransform

    get position() {
        return this.getValue(UIElement.PositionProperty) as Vec3;
    }


    set position (val: Vec3) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.PositionProperty, val.clone());
    }

    get eulerAngles() {
        return Quat.toEuler(new Vec3(), this.rotation) as Vec3;
    }

    set eulerAngles(val: Vec3) {
        const quat = Quat.fromEuler(new Quat(), val.x, val.y, val.z);
        this.rotation = quat;
    }

    get rotation() {
        return this.getValue(UIElement.RotationProperty) as Quat;
    }

    set rotation (val: Quat) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.RotationProperty, val.clone());
    }

    get shear() {
        return this.getValue(UIElement.ShearProperty) as Vec2;
    }


    set shear (val: Vec2) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.ShearProperty, val);
    }

    get scale() {
        return this.getValue(UIElement.ScaleProperty) as Vec3;
    }


    set scale (val: Vec3) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.ScaleProperty, val.clone());
    }

    get renderTransformPivot() {
        return this.getValue(UIElement.RenderTransformPivotProperty) as Vec2;
    }

    set renderTransformPivot(val: Vec2) {
        this.invalidateWorldTransform();
        this.setValue(UIElement.RenderTransformPivotProperty, val.clone());
    }


    get worldTransform(): Readonly<Mat4> {
        if (this._worldTransformDirty) {
            Mat4.fromTranslation(this._worldTransform, new Vec3(this.layout.x, this.layout.y, 0));
            Mat4.multiply(this._worldTransform, this._worldTransform, this.renderTransform);
            if (this.parent) {
                Mat4.multiply(this._worldTransform, this.parent.worldTransform, this._worldTransform);
            }
            this._worldTransformDirty = false;
        }
        return this._worldTransform;
    }

    private get localTransform() {
        if (this._localTransformDirty) {
            const { x: shearX, y: shearY } = this.shear;
            if (approx(shearX, 0) && approx(shearY, 0)) {
                Mat4.fromRTS(this._localTransform, this.rotation, this.position, this.scale);
            } else {
                // apply order: scale -> shear -> rotation -> translation
                Mat4.fromScaling(this._localTransform, this.scale);
                const tempMat = new Mat4();
                tempMat.m01 = shearY;
                tempMat.m04 = shearX;
                Mat4.multiply(this._localTransform, tempMat, this._localTransform);
                Mat4.fromRT(tempMat, this.rotation, this.position);
                Mat4.multiply(this._localTransform, tempMat, this._localTransform);
            }
            this._localTransformDirty = false;
        }
        return this._localTransform;
    }

    private get renderTransform() {
        const { x: xOffsetPercentage, y: yOffsetPercentage } = this.renderTransformPivot;
        if (!approx(xOffsetPercentage, 0.5) || !approx(yOffsetPercentage, 0.5)) {
            const matrix = new Mat4();
            const xOffset = this.layout.width * (xOffsetPercentage - 0.5);
            const yOffset = this.layout.height * (yOffsetPercentage - 0.5);
            Mat4.fromTranslation(matrix, new Vec3(xOffset, yOffset, 0));
            Mat4.multiply(matrix, matrix, this.localTransform);
            const temp = Mat4.fromTranslation(new Mat4(), new Vec3(-xOffset, -yOffset, 0));
            Mat4.multiply(matrix, matrix, temp);
            return matrix;
        }
        return this.localTransform;
    }


    public worldToLocal (out: Vec3, worldPoint: Vec3) {
        const matrix = Mat4.invert(new Mat4(), this.worldTransform);
        return Vec3.transformMat4(out, worldPoint, matrix);
    }

    public localToWorld(out: Vec3, localPoint: Vec3) {
        return Vec3.transformMat4(out, localPoint, this.worldTransform);
    }

    //#endregion RenderTransform
    public removeFromParent () {
        this.setParent(null);
    }

    public setParent (parent: ContainerElement | null) {
        if (parent && !parent.allowMultipleChild() && parent._children.length === 1) {
            throw new UIError(ErrorID.MULTIPLE_CHILD);
        }

        if (this._parent) {
            const index = this._parent._children.indexOf(this);
            assert(index !== -1);
            this._parent._children.splice(index, 1);
        }
        this._parent = parent;
        if (this._parent) {
            this._parent._children.push(this);
        }
        this.updateSlot();
        this.updateDocument(this._parent ? this._parent._document : null);

        this.invalidateWorldTransform();
    }

    //#endregion hierarchy
    private updateSlot () {
        if (!this._parent) {
            this._slot = null;
            return;
        }
        const slotClass = this._parent.getSlotClass();
        if (!this._slot && slotClass) {
            this._slot = new slotClass(this);
            return;
        }
        if (this._slot && slotClass && this._slot.constructor !== slotClass) {
            this._slot = new slotClass(this);
        }
    }

    private updateDocument(document: UIDocument | null) {
        if (this._document !== document) {
            this._document = document;
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].updateDocument(document);
            }
        }
    }


    protected invalidateWorldTransform () {
        if (!this._worldTransformDirty) {
            this._worldTransformDirty = true;
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].invalidateWorldTransform();
            }
        }
    }

    protected invalidateParentMeasure () {
        if (this._parent && !this._parent._measureDirty) {
            this._parent.invalidateParentMeasure();
        }
    }

    protected invalidateParentArrange () {
        if (this._parent && !this._parent._arrangeDirty) {
            this._parent._arrangeDirty = true;
            this._parent.invalidate(InvalidateReason.ARRANGE);
        }
    }

    protected invalidateLocalTransform () {
        this._localTransformDirty = true;
        this.invalidateWorldTransform();
    }

    protected invalidatePainting () {

    }

    public invalidate (invalidateReason: InvalidateReason) {
        if (this._document) {
            this._document.invalidate(this, invalidateReason);
        }
    }

    //#region layout
    /**
     * 
     * @param availableSize 
     */
    protected onMeasure () {
        return new Size(0, 0);
    }

    protected onArrange(arrangeSize: Size) {

    }

    // sealed, invoked by layout system
    public measure () {
        if (this._measureDirty) {
            this.desiredSize = this.onMeasure();
            this._measureDirty = false;
        }
    }

    public arrange (finalRect: Rect) {
        if (this._arrangeDirty || !finalRect.equals(this.layout)) {
            const { width: marginWidth, height: marginHeight} = this.margin;
            const arrangeSize = new Size(Math.max(finalRect.width - marginWidth, 0), Math.max(finalRect.height - marginHeight, 0));
            this.onArrange(arrangeSize);
            this.layout = new Rect(finalRect.x, finalRect.y, arrangeSize.width, arrangeSize.height);
            this._arrangeDirty = false;
        }
    }

    //#endregion layout


    public hitTest(ray: Ray): boolean {
        return true;
    }

    public hitTestByScreenPos(screenPos: Vec2): boolean {
        return true;
    }


    //#endregion

    //#region EventSystem
    //public _callbackTable: ICallbackTable = createMap(true);
    public _callbackMap: Map<Constructor, CallbackList> = new Map();


    protected _eventProcessor: any = new UIElementEventProcessor(this);
    /**
     * @internal
     */
    public static callbacksInvoker = new CallbacksInvoker<DispatcherEventType>();


    public dispatchEvent(event: Event) {
        //  const key = event.eventType as NewUIEventType;
        const target = this;
        if (event instanceof PointerDownEvent) {
            this.emit(PointerDownEvent, target);
        } else if (event instanceof PointerUpEvent) {
            this.emit(PointerUpEvent, target);
        }
    }

    public emit<T extends Event>(classConstructor: Constructor<T>, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
        const key = classConstructor;
        const list: CallbackList = this._callbackMap && this._callbackMap.get(key)!;
        if (list) {
            const rootInvoker = !list.isInvoking;
            list.isInvoking = true;

            const infos = list.callbackInfos;
            for (let i = 0, len = infos.length; i < len; ++i) {
                const info = infos[i];
                if (info) {
                    const callback = info.callback;
                    const target = info.target;
                    // Pre off once callbacks to avoid influence on logic in callback
                    if (info.once) {
                        this.unregisterEventListener(key, callback, target);
                    }
                    // Lazy check validity of callback target,
                    // if target is CCObject and is no longer valid, then remove the callback info directly
                    if (!info.check()) {
                        this.unregisterEventListener(key, callback, target);
                    } else if (target) {
                        callback.call(target, arg0, arg1, arg2, arg3, arg4);
                    } else {
                        callback(arg0, arg1, arg2, arg3, arg4);
                    }
                }
            }

            if (rootInvoker) {
                list.isInvoking = false;
                if (list.containCanceled) {
                    list.purgeCanceled();
                }
            }
        }
    }


    public registerEventListener<T extends Event>(classConstructor: Constructor<T>, callback: Function, target?: unknown, once: boolean = false) {
        //const object = new classConstructor();
        const key = classConstructor;
        if (!this._hasEventListener(key, callback, target)) {
            let list = this._callbackMap.get(key);
            if (!list) {
                list = callbackListPool.alloc();
                this._callbackMap.set(key, list);
            }
            const info = callbackInfoPool.alloc();
            info.set(callback, target, once);
            list.callbackInfos.push(info);

            //add this in PointerInputModule
            UIElement.callbacksInvoker.emit(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this);
        }
        return callback;
    }

    public unregisterEventListener<T extends Event>(classConstructor: Constructor<T>, callback: Function, target?: unknown, useCapture: any = false) {
        //const object = new classConstructor();
        const key = classConstructor;
        const list = this._callbackMap && this._callbackMap.get(key);
        if (list) {
            const infos = list.callbackInfos;
            if (callback) {
                for (let i = 0; i < infos.length; ++i) {
                    const info = infos[i];
                    if (info && info.callback === callback && info.target === target) {
                        list.cancel(i);
                        break;
                    }
                }
            } else {
                this._removeAll(key);
            }
        }
    }

    // public registerEventListener(key: NewUIEventType, callback: Function, target?: unknown, once: boolean = false) {
    //     if (!this.hasEventListener(key, callback, target)) {
    //         let list = this._callbackTable[key];
    //         if (!list) {
    //             list = this._callbackTable[key] = callbackListPool.alloc();
    //         }
    //         const info = callbackInfoPool.alloc();
    //         info.set(callback, target, once);
    //         list.callbackInfos.push(info);

    //         //add this in PointerInputModule
    //         UIElement.callbacksInvoker.emit(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this);
    //     }
    //     return callback;
    // }

    // public unregisterEventListener(key: NewUIEventType, callback: Function, target?: unknown, useCapture: any = false) {
    //     const list = this._callbackTable && this._callbackTable[key];
    //     if (list) {
    //         const infos = list.callbackInfos;
    //         if (callback) {
    //             for (let i = 0; i < infos.length; ++i) {
    //                 const info = infos[i];
    //                 if (info && info.callback === callback && info.target === target) {
    //                     list.cancel(i);
    //                     break;
    //                 }
    //             }
    //         } else {
    //             this.removeAll(key);
    //         }
    //     }
    // }

    private _removeAll<T extends Event>(classConstructor: Constructor<T>) {
        const key = classConstructor;
        // remove by key
        const list = this._callbackMap && this._callbackMap.get(key);
        if (list) {
            if (list.isInvoking) {
                list.cancelAll();
            } else {
                list.clear();
                callbackListPool.free(list);
                this._callbackMap.delete(key);
            }
        }

    }

    private _hasEventListener<T extends Event>(classConstructor: Constructor<T>, callback?: Function, target?: unknown) {
        //const list = this._callbackTable && this._callbackTable[key];
        const list = this._callbackMap && this._callbackMap.get(classConstructor);
        if (!list) {
            return false;
        }

        // check any valid callback
        const infos = list.callbackInfos;
        if (!callback) {
            // Make sure no cancelled callbacks
            if (list.isInvoking) {
                for (let i = 0; i < infos.length; ++i) {
                    if (infos[i]) {
                        return true;
                    }
                }
                return false;
            } else {
                return infos.length > 0;
            }
        }

        for (let i = 0; i < infos.length; ++i) {
            const info = infos[i];
            if (info && info.check() && info.callback === callback && info.target === target) {
                return true;
            }
        }
        return false;
    }

    //#endregion EventSystem

    //#region register

    protected _registerEvent() { }
    protected _unregisterEvent() { }

    //#endregion register

}
