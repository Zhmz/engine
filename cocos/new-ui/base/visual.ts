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
import { VisualProxy } from '../rendering/visual-proxy';
import { AdvancedObject } from './advanced-object';
import { IDrawingContext } from './ui-drawing-context';

export class Visual extends AdvancedObject {
    private _visualProxy = new VisualProxy();

    get visualProxy () {
        return this._visualProxy;
    }

    protected setIsVisible (val: boolean) {
        this._visualProxy.isVisible = val;
    }

    protected setCascadedOpacity (val: number) {
        this._visualProxy.opacity = val;
    }

    protected setVisualTransform (val: Readonly<Mat4>) {
        this._visualProxy.worldMatrix = val;
    }

    protected removeVisualChild (child: Visual) {
        this._visualProxy.removeChild(child._visualProxy);
    }

    protected addVisualChild (child: Visual) {
        this._visualProxy.addChild(child._visualProxy);
    }

    protected clearVisualChildren () {
        this._visualProxy.clearChildren();
    }

    protected onPaint (drawingContext: IDrawingContext) {}

    public paint (drawingContext: IDrawingContext) {
        this.onPaint(drawingContext);
    }
}
