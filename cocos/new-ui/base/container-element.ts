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

import { assert } from '../../core';
import { ErrorID, UIError } from './error';
import { UIElement } from './ui-element';
import { UISlot } from './ui-slot';

export class ContainerElement extends UIElement {
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
        if (child.parent === this) {
            throw new UIError(ErrorID.INVALID_INPUT);
        }
        child.setParent(this);
    }

    public removeChild (child: UIElement) {
        if (child.parent !== this) {
            throw new UIError(ErrorID.INVALID_INPUT);
        }
        const index = this._children.indexOf(child);
        assert(index !== -1);
        this.removeChildAt(index);
    }

    public removeChildAt (index: number) {
        if (index < 0 || index > this._children.length - 1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        const child = this._children[index];
        child.setParent(null);
    }

    public allowMultipleChild () {
        return false;
    }

    protected getSlotClass (): typeof UISlot {
        return UISlot;
    }

    public onChildAdded (child: UIElement) {
        child.addBehavior(this.getSlotClass());
    }

    public onChildRemoved (oldChild: UIElement) {
        oldChild.removeBehavior(UISlot);
    }
}
