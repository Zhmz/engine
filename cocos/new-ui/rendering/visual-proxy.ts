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
import { UIRenderData, UIRenderDataFactory, Visual } from '../base/visual';
import { UIDrawCommand } from './ui-draw-command';

export enum VisualDirty {
    TRANSFORM = 1,
    OPACITY = 1 << 1,
}

class VisualProxyFactory extends UIRenderDataFactory {
    public produce (visual: Visual): VisualProxy {
        return new VisualProxy();
    }
}

Visual.registerRenderDataFactory(new VisualProxyFactory());

export class VisualProxy extends UIRenderData {
    private _parent: VisualProxy | null = null;
    private _childrenHead: VisualProxy | null = null;
    private _nextSibling: VisualProxy | null = null;
    private _worldMatrix: Mat4 = new Mat4();
    private _isVisible = true;
    private _opacity = 1;
    private _dirtyFlag = 3;// hack to dirty

    public get dirtyFlags () {
        return this._dirtyFlag;
    }

    public get isVisible () {
        return this._isVisible;
    }

    public get opacity () {
        return this._opacity;
    }

    public get worldMatrix () {
        return this._worldMatrix;
    }

    public get parent () {
        return this._parent;
    }

    public get children () {
        return this._childrenHead;
    }

    public get nextSibling () {
        return this._nextSibling;
    }

    public resetDirty () {
        this._dirtyFlag = 0;
    }

    public setIsVisible (val) {
        this._isVisible = val;
    }

    public setCascadedOpacity (val) {
        this._opacity = val;
        this._dirtyFlag |= VisualDirty.OPACITY;
    }

    public setWorldMatrix (val) {
        this._worldMatrix.set(val);
        this._dirtyFlag |= VisualDirty.TRANSFORM;
    }

    public addChild (child: VisualProxy) {
        if (child._parent) {
            child._parent.removeChild(child);
        }

        if (!this._childrenHead) {
            this._childrenHead = child;
        } else {
            let cur = this._childrenHead;
            while (cur) {
                if (cur._nextSibling === null) {
                    cur._nextSibling = child;
                    break;
                }
                cur = cur._nextSibling;
            }
        }
        child._parent = this;
    }

    public removeChild (child: VisualProxy) {
        let cur = this._childrenHead;
        if (child === this._childrenHead) {
            this._childrenHead = child._nextSibling;
        } else {
            while (cur) {
                if (cur._nextSibling === child) {
                    cur._nextSibling = child._nextSibling;
                    break;
                }
                cur = cur._nextSibling;
            }
        }
        child._nextSibling = null;
        child._parent = null;
    }

    public clearChildren () {
        let cur = this._childrenHead;
        while (cur) {
            cur._parent = null;
            const next = cur._nextSibling;
            cur._nextSibling = null;
            cur = next;
        }
        this._childrenHead = null;
    }

    public addDrawCommands (command: UIDrawCommand) {
        this._drawCommands.push(command);
    }

    public getDrawCommands (): ReadonlyArray<UIDrawCommand> {
        return this._drawCommands;
    }

    public clearDrawCommands () {
        this._drawCommands.length = 0;
    }

    private _drawCommands: UIDrawCommand[] = [];
}
