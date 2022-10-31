
import { ErrorID, UIError } from "../base/error";
import { ContainerElement } from "../base/container-element";
import { UIElement } from "../base/ui-element";

export class Panel extends ContainerElement {
    
    public insertChildAt (child: UIElement, index: number) {
        if (index < 0 || index > this._children.length - 1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        if (child.parent === this) {
            throw new UIError(ErrorID.INVALID_INPUT);
        }
        child.setParent(this);
        this.changeChildOrder(child, index);
    }

    public changeChildOrder (child: UIElement, index: number) {
        if (index < 0 || index > this._children.length - 1) {
            throw new UIError(ErrorID.OUT_OF_RANGE);
        }
        if (child.parent !== this) {
            throw new UIError(ErrorID.INVALID_INPUT);
        }
        const originIndex = this._children.indexOf(child);
        if (originIndex === index) { return; }
        this._children.splice(index, 0, child);
        if (originIndex > index) {
            this._children.splice(originIndex + 1, 1);
        } else {
            this._children.splice(originIndex, 1);
        }
    }
    
    public allowMultipleChild () {
        return true;
    }
}