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

import { Color, Rect, Size, Vec2 } from '../../core';
import { AdvancedProperty } from '../base/advanced-property';
import { IDrawingContext } from '../base/ui-drawing-context';
import { UIElement } from '../base/ui-element';
import { Brush } from '../rendering/brush';

export class Image extends UIElement {
    public static SourceProperty = AdvancedProperty.register('Source', Brush, Image, Brush.WHITE);
    public static TintColorProperty = AdvancedProperty.register('TintColor', Color, Image, Color.WHITE);

    get source (): Readonly<Brush> {
        return this.getValue(Image.SourceProperty) as Brush;
    }

    set source (val: Readonly<Brush>) {
        this.invalidateMeasure();
        this.invalidatePainting();
        this.setValue(Image.SourceProperty, val);
    }

    get tintColor (): Readonly<Color> {
        return this.getValue(Image.TintColorProperty) as Color;
    }

    set tintColor (val) {
        this.invalidatePainting();
        this.setValue(Image.TintColorProperty, val);
    }

    computeDesiredSize () {
        const { width: naturalWidth, height: naturalHeight } = this.source;
        return new Size(naturalWidth, naturalHeight);
    }

    protected onPaint (drawingContext: IDrawingContext) {
        drawingContext.drawBrush(Rect.fromCenterSize(new Rect(), Vec2.ZERO, this.layoutRect.size), this.tintColor, this.source);
    }
}
