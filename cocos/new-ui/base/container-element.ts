import { assert } from "../../core";
import { ErrorID, UIError } from "./error";
import { UIElement } from "./ui-element";
import { UISlot } from "./ui-slot";

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

    public getSlotClass (): typeof UISlot {
        return UISlot;
    }
}