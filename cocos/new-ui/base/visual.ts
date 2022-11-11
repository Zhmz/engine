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

import { Mat4 } from '../../core/math';
import { AdvancedObject } from './advanced-object';
import { ErrorID, UIError } from './error';
import { IDrawingContext } from './ui-drawing-context';

export class UIRenderData {
    setIsVisible (val: boolean) {}
    setCascadedOpacity (val: number) {}
    setWorldMatrix (val: Mat4) {}
    clearChildren () {}
    addChild (child: UIRenderData) {}
    removeChild (child: UIRenderData) {}
}

export class UIRenderDataFactory {
    public produce (visual: Visual) {
        return new UIRenderData();
    }
}

export class Visual extends AdvancedObject {
    private _renderData: UIRenderData = Visual.allocateRenderData(this);

    get renderData () {
        return this._renderData;
    }

    protected setIsVisible (val: boolean) {
        this._renderData.setIsVisible(val);
    }

    protected setCascadedOpacity (val: number) {
        this._renderData.setCascadedOpacity(val);
    }

    protected setVisualTransform (val: Readonly<Mat4>) {
        this._renderData.setWorldMatrix(val);
    }

    protected removeVisualChild (child: Visual) {
        this._renderData.removeChild(child._renderData);
    }

    protected addVisualChild (child: Visual) {
        this._renderData.addChild(child._renderData);
    }

    protected clearVisualChildren () {
        this._renderData.clearChildren();
    }

    protected onPaint (drawingContext: IDrawingContext) {}

    public paint (drawingContext: IDrawingContext) {
        this.onPaint(drawingContext);
    }

    private static _renderDataFactory = new UIRenderDataFactory();
    static registerRenderDataFactory (renderDataFactory: UIRenderDataFactory) {
        this._renderDataFactory = renderDataFactory;
    }

    static allocateRenderData (visual: Visual) {
        return this._renderDataFactory.produce(visual);
    }
}
