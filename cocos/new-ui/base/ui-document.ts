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

import { Mat4, Rect } from '../../core/math';
import { UIDocumentSettings } from './ui-document-settings';
import { InvalidateReason, UIElement } from './ui-element';
import { UISubSystem } from './ui-subsystem';
import { UIWindow } from './ui-window';

type UISubSystemType <T extends UISubSystem> = new (document: UIDocument) => T;

export enum UISubSystemStage {
    EVENT = 0,
    LAYOUT = 100,
    TRANSFORM = 200,
    PAINT = 300,
}
export class UIDocument {
    get viewport (): Readonly<Rect> {
        return this._viewport;
    }

    get origin (): Readonly<Mat4> {
        return this._origin;
    }

    get settings () {
        return this._settings;
    }

    set settings (val: UIDocumentSettings) {
        this._settings = val;
    }

    get window () {
        return this._window;
    }

    invalidate (element: UIElement, invalidateReason: InvalidateReason) {
        for (let i = 0; i < this._subsystems.length; i++) {
            this._subsystems[i].invalidate(element, invalidateReason);
        }
    }

    removeInvalidation (element: UIElement, invalidateReason: InvalidateReason) {
        for (let i = 0; i < this._subsystems.length; i++) {
            this._subsystems[i].removeInvalidation(element, invalidateReason);
        }
    }

    update () {
        for (let i = 0; i < this._subsystems.length; i++) {
            this._subsystems[i].update();
        }
    }

    /**
     * @engineInternal
     */
    setViewport (val: Readonly<Rect>) {
        if (!this._viewport.equals(val)) {
            this._viewport.set(val);
            this.window.invalidateArrange();
        }
    }

    /**
     * @engineInternal
     */
    setOrigin (val: Readonly<Mat4>) {
        if (!this._origin.equals(val)) {
            this._origin.set(val);
            this.window.invalidateWorldTransform();
        }
    }

    onElementMounted (element: UIElement) {
        for (let i = 0; i < this._subsystems.length; i++) {
            this._subsystems[i].onElementMounted(element);
        }
    }

    onElementUnmounted (element: UIElement) {
        for (let i = 0; i < this._subsystems.length; i++) {
            this._subsystems[i].onElementUnmounted(element);
        }
    }

    getSubSystem <T extends UISubSystem> (type: Constructor<T>): T | null {
        for (let i = 0; i < this._subsystems.length; i++) {
            if (this._subsystems[i] instanceof type) {
                return this._subsystems[i] as T;
            }
        }
        return null;
    }

    private static _registerSubsystems: { stage: UISubSystemStage, type: UISubSystemType<UISubSystem>}[] = [];

    public static getAllRegisterSubsystems (): ReadonlyArray<UISubSystemType<UISubSystem>> {
        return this._registerSubsystems.map((item) => item.type);
    }

    public static registerSubsystem (type: UISubSystemType<UISubSystem>, stage: UISubSystemStage) {
        this._registerSubsystems.push({ type, stage });
        this._registerSubsystems.sort((itemA, itemB) => itemA.stage - itemB.stage);
    }

    constructor () {
        this._subsystems = [];
        const registerSubsystems = UIDocument.getAllRegisterSubsystems();
        for (let i = 0; i < registerSubsystems.length; i++) {
            this._subsystems.push(new registerSubsystems[i](this));
        }
        this._window = new UIWindow(this);
    }

    private _subsystems: UISubSystem[];
    private _settings: UIDocumentSettings = UIDocumentSettings.produceDefaultSettings();
    private _origin = new Mat4();
    private _viewport = new Rect();
    private _window: UIWindow;
}
