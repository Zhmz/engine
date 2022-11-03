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
import { IDrawingContext } from './ui-drawing-context';
import { assert } from '../../core/platform/debug';
import { ErrorID, UIError } from './error';
import { Thickness } from './thickness';
import { UIBehavior, UIBehaviorType } from './ui-behavior';
import { UIDocument } from './ui-document';
import { approx, Mat4, Rect, Size } from '../../core';
import { Ray } from '../../core/geometry';
import { ContainerElement } from './container-element';
import { Visual } from './visual';
import { UISlot } from './ui-slot';
import { EventType, IUIEventCallback, UIEvent } from './ui-event';

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

    protected _behaviors: Array<UIBehavior> = [];
    protected _document: UIDocument | null = null;
    protected _parent: ContainerElement | null = null;
    protected _children: Array<UIElement> = [];
    protected _eventListeners: Array<IUIEventCallback<UIEvent>> = [];
    protected _layout = new Rect();
    protected _previousArrangeRect = new Rect();
    protected _desiredSize = new Size();
    protected _worldTransform = new Mat4();
    protected _localTransform = new Mat4();
    protected _worldTransformDirty = false;
    protected _localTransformDirty = false;
    protected _measureDirty = false;
    protected _arrangeDirty = false;
    protected _hierarchyLevel = 0;

    get slot () {
        return this.getBehavior(UISlot);
    }

    get parent () {
        return this._parent;
    }

    get document () {
        return this._document;
    }

    get hierarchyLevel () {
        return this._hierarchyLevel;
    }

    //#region Layout

    get previousArrangeRect () {
        return this._previousArrangeRect;
    }

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

    get margin () {
        return this.getValue(UIElement.MarginProperty) as Thickness;
    }

    set margin (val: Thickness) {
        this.invalidateParentMeasure();
        this.invalidateParentArrange();
        this.setValue(UIElement.MarginProperty, val);
    }

    get flowDirection () {
        return this.getValue(UIElement.FlowDirectionProperty) as FlowDirection;
    }

    set flowDirection (flowDirection: FlowDirection) {
        this.invalidateParentArrange();
        this.setValue(UIElement.FlowDirectionProperty, flowDirection);
    }
    //#endregion Layout

    //#region Display

    get opacity () {
        return this.getValue(UIElement.OpacityProperty) as number;
    }

    set opacity (val: number) {
        this.setValue(UIElement.OpacityProperty, val);
    }

    get visibility () {
        return this.getValue(UIElement.VisibilityProperty) as Visibility;
    }

    set visibility (val: Visibility) {
        this.invalidateParentMeasure();
        this.setValue(UIElement.VisibilityProperty, val);
    }

    get clipToBounds () {
        return this.getValue(UIElement.ClipToBoundsProperty) as boolean;
    }

    set clipToBounds (val: boolean) {
        this.setValue(UIElement.ClipToBoundsProperty, val);
    }

    //#endregion Display

    //#region RenderTransform

    get position () {
        return this.getValue(UIElement.PositionProperty) as Vec3;
    }

    set position (val: Vec3) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.PositionProperty, val.clone());
    }

    get eulerAngles () {
        return Quat.toEuler(new Vec3(), this.rotation) as Vec3;
    }

    set eulerAngles (val: Vec3) {
        const quat = Quat.fromEuler(new Quat(), val.x, val.y, val.z);
        this.rotation = quat;
    }

    get rotation () {
        return this.getValue(UIElement.RotationProperty) as Quat;
    }

    set rotation (val: Quat) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.RotationProperty, val.clone());
    }

    get shear () {
        return this.getValue(UIElement.ShearProperty) as Vec2;
    }

    set shear (val: Vec2) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.ShearProperty, val);
    }

    get scale () {
        return this.getValue(UIElement.ScaleProperty) as Vec3;
    }

    set scale (val: Vec3) {
        this.invalidateLocalTransform();
        this.setValue(UIElement.ScaleProperty, val.clone());
    }

    get renderTransformPivot () {
        return this.getValue(UIElement.RenderTransformPivotProperty) as Vec2;
    }

    set renderTransformPivot (val: Vec2) {
        this.invalidateWorldTransform();
        this.setValue(UIElement.RenderTransformPivotProperty, val.clone());
    }


    get worldTransform (): Readonly<Mat4> {
        if (this._worldTransformDirty) {
            Mat4.fromTranslation(this._worldTransform, new Vec3(this.layout.center.x, this.layout.center.y, 0));
            Mat4.multiply(this._worldTransform, this._worldTransform, this.renderTransform);
            if (this.parent) {
                Mat4.multiply(this._worldTransform, this.parent.worldTransform, this._worldTransform);
            }
            this._worldTransformDirty = false;
        }
        return this._worldTransform;
    }

    private get localTransform () {
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

    private get renderTransform () {
        const { x : xOffsetPercentage, y : yOffsetPercentage } = this.renderTransformPivot;
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

    public localToWorld (out: Vec3, localPoint: Vec3) {
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
            this._parent.onChildRemoved(this);
        }
        this.invalidateParentMeasure();
        this._parent = parent;
        if (this._parent) {
            this._parent._children.push(this);
            this._parent.onChildAdded(this);
        }
        this.updateHierarchyLevel(this._parent ? this._parent._hierarchyLevel + 1 : 0);
        this.updateDocument(this._parent ? this._parent._document : null);
        this.invalidateParentMeasure();
        this.invalidateWorldTransform();
    }

    //#endregion hierarchy
    private updateHierarchyLevel (level: number) {
        if (this._hierarchyLevel !== level) {
            this._hierarchyLevel = level;
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].updateHierarchyLevel(level + 1);
            }
        }
    }

    private updateDocument (document: UIDocument | null) {
        if (this._document !== document) {
            this._document = document;
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].updateDocument(document);
            }
        }
    }

    public invalidateWorldTransform () {
        if (!this._worldTransformDirty) {
            this._worldTransformDirty = true;
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].invalidateWorldTransform();
            }
        }
    }

    public invalidateParentMeasure () {
        if (this._parent) {
            this._parent.invalidateMeasure();
        }
    }

    public invalidateParentArrange () {
        if (this._parent) {
            this._parent.invalidateArrange();
        }
    }

    public invalidateMeasure () {
        if (!this._measureDirty) {
            this._measureDirty = true;
            if (this._parent) {
                this._parent.invalidateMeasure();
            }
        }
    }

    public invalidateArrange () {
        if (!this._arrangeDirty) {
            this._arrangeDirty = true;
            this.invalidate(InvalidateReason.ARRANGE);
        }
    }

    public invalidateLocalTransform () {
        this._localTransformDirty = true;
        this.invalidateWorldTransform();
    }

    public invalidatePainting () {

    }

    public invalidate (invalidateReason: InvalidateReason) {
        if (this._document) {
            this._document.invalidate(this, invalidateReason);
        }
    }

    //#region Behavior
    
    public getBehavior <T extends UIBehavior> (type: UIBehaviorType<T>): T | null {
        for (let i = 0; i < this._behaviors.length; i++) {
            const behavior = this._behaviors[i];
            if (behavior instanceof type) {
                return behavior;
            }
        }
        return null;
    }

    public addBehavior<T extends UIBehavior> (type: UIBehaviorType<T>): T {
        if (this.getBehavior(type)) {
            console.warn('Add a duplicated behavior, the old one will be removed!');
            this.removeBehavior(type);
        }
        const newBehavior = UIBehavior.produce(type, this);
        this._behaviors.push(newBehavior);
        return newBehavior;
    }

    public removeBehavior<T extends UIBehavior> (type: UIBehaviorType<T>) {
        for (let i = this._behaviors.length - 1; i >= 0; i--) {
            const behavior = this._behaviors[i];
            if (behavior instanceof type) {
                this._behaviors.splice(i, 1);
            }
            const registeredProperties = AdvancedProperty.getRegisteredPropertiesForOwnerType(type);
            for (let i = 0; i < registeredProperties.length; i++) {
                this.clearValue(registeredProperties[i]);
            }
        }
    }

    //#endregion Behavior

    //#region layout
    protected computeDesiredSize () {
        return new Size(0, 0);
    }

    protected arrangeContent (arrangeSize: Size) {}

    // sealed, invoked by layout system
    public measure () {
        if (this._measureDirty) {
            const desiredSize = this.computeDesiredSize();
            if (!this._desiredSize.equals(desiredSize)) {
                this._desiredSize.set(desiredSize);
                this.invalidateParentArrange();
            }
            this._measureDirty = false;
        }
    }

    public arrange (finalRect: Rect) {
        const { left: marginLeft, bottom: marginBottom, width: marginWidth, height: marginHeight} = this.margin;
        const arrangeSize = new Size(Math.max(finalRect.width - marginWidth, 0), Math.max(finalRect.height - marginHeight, 0));
        if (this._arrangeDirty || !arrangeSize.equals(this.layout.size)) {
            this.arrangeContent(arrangeSize);
            this._arrangeDirty = false;
        }
        this._previousArrangeRect.set(finalRect);
        this.layout = new Rect(finalRect.x + marginLeft, finalRect.y + marginBottom, arrangeSize.width, arrangeSize.height);
    }
    
    //#endregion layout

    //#endregion render
    protected onPaint (drawingContext: IDrawingContext) {}
    //#endregion render

    // #region event
    public hitTest (ray: Ray): boolean {
        return false;
    }

    public addEventListener<TEvent extends UIEvent> (type: EventType<TEvent>, fn: (event: TEvent) => void, target?: any) {
        this._eventListeners.push({ eventType: type, callback: fn, target });
    }

    public removeEventListener<TEvent extends UIEvent> (type: EventType<TEvent>, fn: (event: TEvent) => void, target?: any) {
        const index = this._eventListeners.findIndex((val) => val.eventType === type && val.callback === fn && val.target === target);
        if (index !== -1) {
            this._eventListeners.splice(index, 1);
        }
    }

    public hasEventListener<TEvent extends UIEvent> (type: EventType<TEvent>, fn: (event: TEvent) => void, target?: any) {
        return this._eventListeners.findIndex((val) => val.eventType === type && val.callback === fn && val.target === target) !== -1;
    }

    public dispatchEvent (event: UIEvent) {
        for (let i = 0; i < this._eventListeners.length; i++) {
            const { eventType, target, callback } = this._eventListeners[i];
            if (event.constructor === eventType) {
                target ? callback.call(target, event) : callback(event);
            }
        }
    }
    // #endregion event

}
