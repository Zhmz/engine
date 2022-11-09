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
import { ContainerElement } from '../base';
import { RenderMode, UIRuntimeDocumentSettings } from '../base/runtime-document-settings';
import { UIDocument } from '../base/ui-document';
import { InvalidateReason, UIElement, Visibility } from '../base/ui-element';
import { UISubSystem } from '../base/ui-subsystem';
import { RuntimeDrawingContext } from '../rendering/runtime-drawing-context';
import { UIBatchBuilder } from '../rendering/ui-batch-builder';
import { VisualProxy } from '../rendering/visual-proxy';

export class UIRenderSubsystem extends UISubSystem {
    private _dirtyElementMap = new Set<UIElement>();
    private _dirtyHierarchyMap = new Set<UIElement>();
    private _dirtyTransformMap = new Set<UIElement>();
    private _dirtyVisibilityMap = new Set<UIElement>();
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

    onElementMounted (element: UIElement) {
        this.connectSubtree(element, null);
    }

    connectSubtree (element: UIElement, parent: VisualProxy | null) {
        if (!element.renderData) {
            element.renderData = VisualProxy.allocate(element);
        }
        if (parent) {
            parent.addChild(element.renderData as VisualProxy);
        }
        if (element instanceof ContainerElement) {
            for (let i = 0; i < element.childCount; i++) {
                this.connectSubtree(element.children[i], element.renderData as VisualProxy);
            }
        }
    }

    onElementUnmounted (element: UIElement) {
        this.clearRenderData(element);
    }

    clearRenderData (element: UIElement) {
        element.renderData = null;
        if (element instanceof ContainerElement) {
            for (let i = 0; i < element.childCount; i++) {
                this.clearRenderData(element.children[i]);
            }
        }
    }

    invalidate (element: UIElement, invalidateReason: InvalidateReason) {
        if (invalidateReason & InvalidateReason.PAINT) {
            this._dirtyElementMap.add(element);
        }
        if (invalidateReason & InvalidateReason.HIERARCHY) {
            this._dirtyHierarchyMap.add(element);
        }
        if (invalidateReason & InvalidateReason.TRANSFORM) {
            this._dirtyHierarchyMap.add(element);
        }
        if (invalidateReason & InvalidateReason.VISIBILITY) {
            this._dirtyVisibilityMap.add(element)
        }
    }

    update () {
        for (const element of this._dirtyHierarchyMap) {
            const children = (element as ContainerElement).children;
            const visualProxy = element.renderData as VisualProxy;
            visualProxy.clearChildren();
            for (let i = 0; i < children.length; i++) {
                visualProxy.addChild(children[i].renderData as VisualProxy);
            }
        }
        this._dirtyHierarchyMap.clear();

        for (const element of this._dirtyTransformMap) {
            (element.renderData as VisualProxy).worldMatrix = element.worldTransform;
        }
        this._dirtyTransformMap.clear();

        for (const element of this._dirtyVisibilityMap) {
            (element.renderData as VisualProxy).isVisible = element.visibility === Visibility.VISIBLE;
            (element.renderData as VisualProxy).opacity = element.opacity;
        }
        this._dirtyVisibilityMap.clear();

        for (const element of this._dirtyElementMap) {
            this._drawingContext.paint(element);
        }
        this._dirtyElementMap.clear();

        // build batches
        const visualProxy = this._document.window.renderData as VisualProxy;
        if (!visualProxy) return;
        this._batchBuilder.buildBatches(visualProxy);

        const camera = this.settings.lowLevelRenderCamera;
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
