  
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

import { AdvancedObject } from '../property/advanced-object';
import { AdvancedProperty } from '../property/advanced-property';
import { Enum } from '../../core/value-types/enum';
import { Vec3 } from '../../core/math/vec3';

export enum FlowDirection {
    LTR,
    RTL,
}

export class UIElement extends AdvancedObject {
    public static ActuallyWidthProperty = AdvancedProperty.register('ActuallyWidth', Number, UIElement);
    public static ActuallyHeightProperty = AdvancedProperty.register('ActuallyHeight', Number, UIElement);
    public static FlowDirectionProperty = AdvancedProperty.register('FlowDirection', Enum(FlowDirection), UIElement);
    public static OpacityProperty = AdvancedProperty.register('Opacity', Number, UIElement);
    public static PositionProperty = AdvancedProperty.register('Position', Vec3, UIElement);

    get actuallyWidth () {
        return this.getValue(UIElement.ActuallyWidthProperty) as number;
    }

    get actuallyHeight () {
        return this.getValue(UIElement.ActuallyHeightProperty) as number;
    }


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

    //#endregion Display

    //#region RenderTransform

    get position () {
        return this.getValue(UIElement.PositionProperty) as Vec3;
    }

    set position (val: Vec3) {
        this.setValue(UIElement.PositionProperty, val);
    }

    //#endregion RenderTransform
 
    private _parent: UIElement | null = null;
    private _children: Array<UIElement> = [];

    protected onMeasure () {}
    protected onArrange () {}
    protected onRepaint () {}


}
