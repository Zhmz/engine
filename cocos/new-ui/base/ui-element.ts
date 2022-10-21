  
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

export enum FlowDirection {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
}

export enum Visibility {
    VISIBLE,
    HIDDEN
}
export class UIElement extends AdvancedObject {
    public static ActuallyWidthProperty = AdvancedProperty.register('ActuallyWidth', Primitive.NUMBER, UIElement);
    public static ActuallyHeightProperty = AdvancedProperty.register('ActuallyHeight', Primitive.NUMBER, UIElement);
    public static FlowDirectionProperty = AdvancedProperty.register('FlowDirection', Enum(FlowDirection), UIElement);
    public static OpacityProperty = AdvancedProperty.register('Opacity', Primitive.NUMBER, UIElement);
    public static VisibilityProperty = AdvancedProperty.register('Visibility', Enum(Visibility), UIElement);
    public static ClipToBoundsProperty = AdvancedProperty.register('ClipToBounds', Primitive.BOOLEAN, UIElement);
    public static PositionProperty = AdvancedProperty.register('Position', Vec3, UIElement);
    public static RotationProperty = AdvancedProperty.register('Rotation', Quat, UIElement);
    public static ScaleProperty = AdvancedProperty.register('Scale', Vec3, UIElement);
    public static PivotOriginProperty = AdvancedProperty.register('PivotOrigin', Vec2, UIElement);
    public static MarginProperty = AdvancedProperty.register('Margin', Thickness, UIElement);
    public static PaddingProperty = AdvancedProperty.register('Padding', Thickness, UIElement);

    
    protected _slot: UISlot | null = null;
    protected _parent: UIElement | null = null;
    protected _children: Array<UIElement> = [];
    protected _document: UIDocument | null = null;

    //#region Layout

    get slot () {
        return this._slot;
    }

    get actuallyWidth () {
        return this.getValue(UIElement.ActuallyWidthProperty) as number;
    }

    protected set actuallyWidth (val) {
        this.setValue(UIElement.ActuallyWidthProperty, val);
    }

    get actuallyHeight () {
        return this.getValue(UIElement.ActuallyHeightProperty) as number;
    }

    protected set actuallyHeight (val) {
        this.setValue(UIElement.ActuallyHeightProperty, val);
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

    //#endregion Layout


    //#region Localization
    get flowDirection () {
        return this.getValue(UIElement.FlowDirectionProperty) as FlowDirection;
    }

    set flowDirection (flowDirection: FlowDirection) {
        this.setValue(UIElement.FlowDirectionProperty, flowDirection);
    }
    //#endregion Localization

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
        this.setValue(UIElement.PositionProperty, val);
    }

    get rotation () {
        return this.getValue(UIElement.RotationProperty) as Quat;
    }

    set rotation (val: Quat) {
        this.setValue(UIElement.RotationProperty, val);
    }

    get scale () {
        return this.getValue(UIElement.ScaleProperty) as Vec3;
    }

    set scale (val: Vec3) {
        this.setValue(UIElement.ScaleProperty, val);
    }

    get pivotOrigin () {
        return this.getValue(UIElement.PivotOriginProperty) as Vec2;
    }

    set pivotOrigin (val: Vec2) {
        this.setValue(UIElement.PivotOriginProperty, val);
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

    protected onMeasure () {}
    protected onArrange () {}
    protected onRepaint (drawingContext: IDrawingContext) {}
}
