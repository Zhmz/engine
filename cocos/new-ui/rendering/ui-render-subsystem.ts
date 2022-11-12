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

import { RenderMode, UIRuntimeDocumentSettings } from '../framework/runtime-document-settings';
import { UIDocument, UISubSystemStage } from '../base/ui-document';
import { InvalidateReason, UIElement } from '../base/ui-element';
import { UISubSystem } from '../base/ui-subsystem';
import { RuntimeDrawingContext } from './runtime-drawing-context';
import { UIBatchBuilder } from './ui-batch-builder';
import { VisualProxy } from './visual-proxy';
import { UISystem } from '../ui-system';

export class UIRenderSubsystem extends UISubSystem {
    private _dirtyElementMap = new Set<UIElement>();
    private _drawingContext: RuntimeDrawingContext;
    private _batchBuilder: UIBatchBuilder;

    get context () {
        return this._drawingContext;
    }

    get settings () {
        return this._document.settings as UIRuntimeDocumentSettings;
    }

    constructor (document: UIDocument) {
        super(document);
        this._drawingContext = new RuntimeDrawingContext();
        this._batchBuilder = new UIBatchBuilder(); // 对应关系有点奇怪，几乎是成套
    }

    invalidate (element: UIElement, invalidateReason: InvalidateReason) {
        if (invalidateReason & InvalidateReason.PAINT) {
            this._dirtyElementMap.add(element);
        }
    }

    private get lowLevelRenderCamera () {
        switch (this.settings.renderMode) {
        case RenderMode.OVERLAY:
            return UISystem.instance.hudCamera;
        case RenderMode.CAMERA:
            return this.settings.camera?.camera;
        case RenderMode.WORLD_SPACE:
            return null;
        default:
            return null;
        }
    }

    update () {
        for (const element of this._dirtyElementMap) {
            this._drawingContext.paint(element);
        }
        this._dirtyElementMap.clear();

        // build batches
        this._batchBuilder.buildBatches(this._document.window.renderData as VisualProxy);

        const camera = this.lowLevelRenderCamera;
        camera?.cleanIntermediateModels();
        // insert data
        const renderModel = this._batchBuilder.getContextModel();
        switch (this.settings.renderMode) {
        case RenderMode.CAMERA:
            break;
        case RenderMode.WORLD_SPACE:
            // renderModel.attachToScene();
            break;
        default:
            camera?.addIntermediateModel(renderModel);
            break;
        }
    }
}

UIDocument.registerSubsystem(UIRenderSubsystem, UISubSystemStage.PAINT);
