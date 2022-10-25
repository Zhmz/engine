  
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
import { AdvancedProperty, Primitive } from './advanced-property';
import { Enum } from '../../core/value-types/enum';
import { Vec3 } from '../../core/math/vec3';
import { Vec2 } from '../../core/math/vec2';
import { Quat } from '../../core/math/quat';
import { IDrawingContext } from './ui-drawing-context';
import { assert } from '../../core/platform/debug';
import { ErrorID, UIError } from './error';
import { Thickness } from './thickness';
import { UISlot } from './ui-slot';
import { UIDocument } from './ui-document';
import { approx, Mat4, Rect } from '../../core';
import { Ray } from '../../core/geometry';

export enum FlowDirection {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
}

export enum Visibility {
    VISIBLE,
    HIDDEN
}

export enum InvalidateReason {
    HIERARCHY = 1,
    LAYOUT = 1 << 1,
    STYLE = 1 << 2,
    TRANSFORM = 1 << 3,
    PAINT = 1 << 4
}
export class UIElement extends AdvancedObject {
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
    public static PaddingProperty = AdvancedProperty.register('Padding', Thickness, UIElement, Thickness.ZERO);

    
    protected _slot: UISlot | null = null;
    protected _parent: UIElement | null = null;
    protected _children: Array<UIElement> = [];
    protected _document: UIDocument | null = null;
    protected _layout = new Rect();
    protected _worldTransform = new Mat4();
    protected _localTransform = new Mat4();
    protected _worldTransformDirty = false;
    protected _localTransformDirty = false;

    //#region Layout

    get slot () {
        return this._slot;
    }

    get layout () {
        return this._layout;
    }

    set layout (val: Rect) {
        if (!this._layout.equals(val)) {
            this.invalidateWorldTransform();
            this._layout.set(val);
        }
    }
 
    get margin () {
        return this.getValue(UIElement.MarginProperty) as Thickness;
    }

    set margin (val: Thickness) {
        this.setValue(UIElement.MarginProperty, val);
    }

    get padding () {
        return this.getValue(UIElement.PaddingProperty) as Thickness; 
    }

    set padding (val) {
        this.setValue(UIElement.PaddingProperty, val);
    }

    get flowDirection () {
        return this.getValue(UIElement.FlowDirectionProperty) as FlowDirection;
    }

    set flowDirection (flowDirection: FlowDirection) {
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
        this._localTransformDirty = true;
        this.invalidateWorldTransform();
        this.setValue(UIElement.PositionProperty, val.clone());
    }

    get eulerAngles () {
        return Quat.toEuler(new Vec3(), this.rotation) as Vec3;
    }

    set eulerAngles (val: Vec3) {
        const quat = Quat.fromEuler(new Quat, val.x, val.y, val.z);
        this.rotation = quat;
    }

    get rotation () {
        return this.getValue(UIElement.RotationProperty) as Quat;
    }

    set rotation (val: Quat) {
        this._localTransformDirty = true;
        this.invalidateWorldTransform();
        this.setValue(UIElement.RotationProperty, val.clone());
    }

    get shear () {
        return this.getValue(UIElement.ShearProperty) as Vec2;
    }

    set shear (val: Vec2) {
        this._localTransformDirty = true;
        this.invalidateWorldTransform();
        this.setValue(UIElement.ShearProperty, val);
    }

    get scale () {
        return this.getValue(UIElement.ScaleProperty) as Vec3;
    }

    set scale (val: Vec3) {
        this._localTransformDirty = true;
        this.invalidateWorldTransform();
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
            Mat4.fromTranslation(this._worldTransform, new Vec3(this.layout.x, this.layout.y, 0));
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

    private invalidateWorldTransform () {
        if (!this._worldTransformDirty) {
            this._worldTransformDirty = true;
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].invalidateWorldTransform();
            }
        }
    }

    public worldToLocal (out: Vec3, worldPoint: Vec3) {
        const matrix = Mat4.invert(new Mat4(), this.worldTransform);
        return Vec3.transformMat4(out, worldPoint, matrix);
    }

    public localToWorld (out: Vec3, localPoint: Vec3) {
        return Vec3.transformMat4(out, localPoint, this.worldTransform);
    }

    //#endregion RenderTransform

    get document () {
        return this._document;
    }
 
    //#region hierarchy
    get parent () {
        return this._parent;
    }

    get children (): ReadonlyArray<UIElement> {
        return this._children;
    }

    get childCount (): number {
        return this._children.length;
    }

    public clearChildren () {
        for (let i = this._children.length - 1; i >= 0; i--) {
            this.removeChildAt(i);
        }
    }

    public getChildIndex (child: UIElement): number {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            return index;
        } else {
            throw new UIError(ErrorID.INVALID_INPUT);
        }
    }

    public getChildAt (index: number) {
        if (index < 0 || index > this._children.length - 1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        return this._children[index];
    }

    public addChild (child: UIElement) {
        if (child._parent === this) {
            throw new UIError(ErrorID.INVALID_INPUT)
        }
        child.setParent(this);
    }

    public insertChildAt (child: UIElement, index: number) {
        if (index < 0 || index > this._children.length - 1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        if (child._parent === this) {
            throw new UIError(ErrorID.INVALID_INPUT)
        }
        child.setParent(this, index);
    }

    public removeChild(child: UIElement) {
        if (child._parent !== this) {
            throw new UIError(ErrorID.INVALID_INPUT)
        }
        child.setParent(null);
    }

    public removeChildAt(index: number) {
        if (index < 0 || index > this._children.length -1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        const child = this._children[index];
        child.setParent(null);
    }

    public removeFromParent () {
        this.setParent(null);
    }

    private setParent (parent: UIElement | null, index: number = -1) {
        if (parent && !parent.getSlotClass()) {
            throw new UIError(ErrorID.SLOT_UNMATCHED);
        }
        if (parent && !parent.allowMultipleChild() && parent.children.length === 1) {
            throw new UIError(ErrorID.MULTIPLE_CHILD);
        }

        if (this._parent) {
            const index = this._parent._children.indexOf(this);
            assert(index !== -1);
            this._parent._children.splice(index, 1);
        }
        this._parent = parent;
        if (this._parent) {
            if (index === -1) {
                this._parent._children.push(this);
            } else {
                this._parent._children.splice(index, 0, this);
            }
        }
        this.updateSlot();
        this.updateDocument(this._parent ? this._parent._document : null);
        this.invalidateWorldTransform();
    }

    //#endregion hierarchy
    protected allowMultipleChild () {
        return false;
    }

    protected getSlotClass (): typeof UISlot | null{
        return null;
    }

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

    private updateDocument (document: UIDocument | null) {
        if (this._document !== document) {
            this._document = document;
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].updateDocument(document);
            }
        }
    }

    protected invalidate (dirtyFlags: number) {
        if (this._document) {
            this._document.updateContext.invalidate(this, dirtyFlags);
        }
    }

    //#region layout
    protected onMeasure (availableSize: Vec2) {

    }

    protected onArrange (availableRect: Rect) {

    }

    public measure (availableSize: Vec2) {
        this.onMeasure(availableSize);
    }

    public arrange (availableRect: Rect) {
        this.onArrange(availableRect);
    }
    
    //#endregion layout
    protected onPaint (drawingContext: IDrawingContext) {}

    public hitTest (ray: Ray): boolean {
        return true;
    }
}
