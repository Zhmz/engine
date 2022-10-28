import { UIElement } from "../base/ui-element";

export class Panel extends UIElement {
    protected allowMultipleChild () {
        return true;
    }
}