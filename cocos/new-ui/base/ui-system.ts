
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

import { Director, director, js, System } from "../../core";
import { Camera } from "../../core/renderer/scene/camera";
import { EventSystem } from "../event-system/event-system";
import { RenderMode, UIRuntimeDocumentSettings } from "./runtime-document-settings";
import { UIDocument } from "./ui-document";

export class UISystem extends System {
    private _camera: Camera;

    public get hudCamera () {
        return this._camera;
    }

    static get instance () {
        return UISystem._instance;
    }
    
    get documents (): ReadonlyArray<UIDocument> {
        return this._documents;
    }

    get eventSystem (): EventSystem {
        return this._eventSystem;
    }

    private static _instance = new UISystem();
    private _documents: UIDocument[] = [];
    private _eventSystem = new EventSystem();

    init () {
        this._camera = director.root!.createCamera();
        // init camera
        director.on(Director.EVENT_UI_UPDATE, this.tick, this);
    }

    addDocument (document: UIDocument) {
        if (!this._documents.includes(document)) {
            this._documents.push(document);
        }
    }

    removeDocument (document: UIDocument) {
        js.array.fastRemove(this._documents, document);
    }

    tick () {
        const hasAnyHudUI = this._documents.find((document) => (document.settings as UIRuntimeDocumentSettings).renderMode === RenderMode.OVERLAY);
        if (hasAnyHudUI && !this._camera.scene && director.getScene()) {
            director.getScene()!.renderScene?.addCamera(this._camera);
        } else if (!hasAnyHudUI && this._camera.scene) {
            this._camera.scene.removeCamera(this._camera);
        }
        this._eventSystem.tick();
        for (let i = 0; i < this._documents.length; i++) {
            this._documents[i].update();
        }
    }
}

director.registerSystem('ui-system', UISystem.instance, 0);