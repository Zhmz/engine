import { UILayoutSubsystem } from "../subsystem/ui-layout-subsystem";
import { UIDocument } from "./ui-document";
import { UIElement } from "./ui-element";

export class UIUpdateContext {

    private _layoutSubsystem = new UILayoutSubsystem(this);
    private _document: UIDocument;

    constructor (document: UIDocument) {
        this._document = document;
    }

    get document () {
        return this._document;
    }

    invalidate (element: UIElement, dirtyFlags: number) {

    }

    update () {

    }
}