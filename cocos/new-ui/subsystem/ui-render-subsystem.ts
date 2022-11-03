  
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
import { RenderMode } from "../base/runtime-document-settings";
import { IDrawingContext } from "../base/ui-drawing-context";
import { UIElement } from "../base/ui-element";
import { UISubSystem } from "../base/ui-subsystem";

export class UIRenderSubsystem extends UISubSystem {
    private _dirtyElementMap = new Set;
    private _context = new IDrawingContext();

    invalidate(element: UIElement) {
        if (!this._dirtyElementMap.has(element)) {
            this._dirtyElementMap.add(element)
            // 部分更新用
            // 能否在这里进行 transform 的更新
        }
    }

    update () {
        const camera = this._document.settings.camera!;
        camera.cleanIntermediateModels();

        // Assembly data
        this._context.paint();

        // insert data
        const renderModel = this._context.getContextModel();
        switch (this._document.settings.renderMode) {
            case RenderMode.CAMERA:
                break;
            case RenderMode.WORLD_SPACE:
                // renderModel.attachToScene();
                break;
            default:
                camera.addIntermediateModel(renderModel);
                break;
        }
    }
}