
import { Director, director, js, System } from "../../core";
import { EventSystem } from "../event-system/event-system";
import { UIDocument } from "./ui-document";

export class UISystem extends System {
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
    private _eventSystem:EventSystem = new EventSystem();

    init () {
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
        this._eventSystem.tick(this._documents);
        for (let i = 0; i < this._documents.length; i++) {
            this._documents[i].update();
        }
    }
}

director.registerSystem('ui-system', UISystem.instance, 0);