  
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

import { Size } from "../../core";
import { UILayout } from "../base/ui-slot";
import { Panel } from "./panel";
import { Vec2 } from "../../core/math/vec2";
import { Anchors } from "../base/anchors";
import { Thickness } from "../base/thickness";
import { AdvancedProperty } from "../base/advanced-property";
import { InvalidateReason } from "../base/ui-element";

export class CanvasSlot extends UILayout {
    public static AnchorsProperty = AdvancedProperty.register('Anchors', Anchors, CanvasSlot, Anchors.ZERO);
    public static OffsetsProperty = AdvancedProperty.register('Offsets', Thickness, CanvasSlot, Thickness.ZERO);
    public static PivotProperty = AdvancedProperty.register('Pivot', Vec2, CanvasSlot, Vec2.ZERO);

    get anchors () {
        return this.getValue(CanvasSlot.AnchorsProperty) as Anchors;
    }

    set anchors (val: Anchors) {
        this.element.invalidate(InvalidateReason.LAYOUT);
        this.setValue(CanvasSlot.AnchorsProperty, val);
    }

    get offsets () {
        return this.getValue(CanvasSlot.OffsetsProperty) as Thickness;
    }

    set offsets (val) {
        this.element.invalidate(InvalidateReason.LAYOUT);
        this.setValue(CanvasSlot.OffsetsProperty, val);
    }

    get pivot () {
        return this.getValue(CanvasSlot.PivotProperty) as Vec2;
    }

    set pivot (val) {
        this.element.invalidate(InvalidateReason.LAYOUT);
        this.setValue(CanvasSlot.PivotProperty, val);
    }
}

export class Canvas extends Panel {
    protected getSlotClass () {
        return CanvasSlot;
    }

    protected computeDesiredSize () {
        return Size.ZERO;
    }

    protected arrangeContent () {
        const childCount = this.childCount;
        if (childCount === 0) return;
        for (let i = 0; i < childCount; i++) {
            const child = this._children[i];
            const canvasSlot = child.slot as CanvasSlot;
        }
    }
}