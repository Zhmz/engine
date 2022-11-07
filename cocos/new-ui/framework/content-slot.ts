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

import { Size } from '../../core';
import { Enum } from '../../core/value-types';
import { AdvancedProperty } from '../base/advanced-property';
import { InvalidateReason } from '../base/ui-element';
import { UISlot } from '../base/ui-slot';

export enum HorizontalAlignment {
    LEFT,
    CENTER,
    RIGHT,
    STRETCH
}

export enum VerticalAlignment {
    TOP,
    CENTER,
    BOTTOM,
    STRETCH
}

export class ContentSlot extends UISlot {
    public static HorizontalAlignmentProperty = AdvancedProperty.register('HorizontalAlignment', Enum(HorizontalAlignment), ContentSlot, HorizontalAlignment.CENTER);
    public static VerticalAlignmentProperty = AdvancedProperty.register('VerticalAlignment', Enum(VerticalAlignment), ContentSlot, HorizontalAlignment.CENTER);

    get horizontalAlignment () {
        return this.getValue(ContentSlot.HorizontalAlignmentProperty) as HorizontalAlignment;
    }

    set horizontalAlignment (val) {
        this.element.invalidateParentArrange();
        this.setValue(ContentSlot.HorizontalAlignmentProperty, val);
    }

    get verticalAlignment () {
        return this.getValue(ContentSlot.VerticalAlignmentProperty) as VerticalAlignment;
    }

    set verticalAlignment (val) {
        this.element.invalidateParentArrange();
        this.setValue(ContentSlot.VerticalAlignmentProperty, val);
    }
}
