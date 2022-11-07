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
import { EventSubSystem } from '../subsystem/event-sub-system';
import { UILayoutSubsystem } from '../subsystem/ui-layout-subsystem';
import { UIRenderSubsystem } from '../subsystem/ui-render-subsystem';
import { UIRuntimeDocumentSettings } from './runtime-document-settings';
import { UIDocumentSettings } from './ui-document-settings';
import { InvalidateReason, UIElement } from './ui-element';
import { UIWindow } from './ui-window';

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

    get eventSubSystem () {
        return this._eventSubSystem;
    }

    get renderSubSystem () {
        return this._renderSubsystem;
    }

    invalidate (element: UIElement, invalidateReason: InvalidateReason) {
        this._layoutSubsystem.invalidate(element, invalidateReason);
        this._renderSubsystem.invalidate(element, invalidateReason);
    }

    removeInvalidation (element: UIElement, invalidateReason: InvalidateReason) {
        if (invalidateReason & InvalidateReason.LAYOUT) {
            this._layoutSubsystem.removeInvalidation(element, invalidateReason);
        }
        if (invalidateReason & InvalidateReason.PAINT) {
            this._renderSubsystem.removeInvalidation(element, invalidateReason);
        }
    }

    update () {
        this._settings.update();
        this._layoutSubsystem.update();
        this._renderSubsystem.update();
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

    onElementRemoved (element: UIElement) {
        this._renderSubsystem.onElementRemoved(element);
    }

    onElementAdded (element: UIElement) {
        this._renderSubsystem.onElementAdded(element);
    }

    private _settings: UIDocumentSettings = new UIRuntimeDocumentSettings(this);
    private _origin = new Mat4();
    private _viewport = new Rect();
    private _window = new UIWindow(this);
    private _layoutSubsystem = new UILayoutSubsystem(this);
    private _eventSubSystem = new EventSubSystem(this);
    private _renderSubsystem = new UIRenderSubsystem(this);
}
