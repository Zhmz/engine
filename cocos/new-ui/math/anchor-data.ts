import { Vec2 } from "../../core/math/vec2";
import { ValueType } from "../../core/value-types";
import { Anchors } from "./anchors";
import { Thickness } from "./thickness";


export class AnchorData extends ValueType{
    private _anchors: Anchors;
    private _offset: Thickness;
    private _pivot: Vec2;

    get anchors (): Anchors {
        return this._anchors;
    }

    set anchors (val: Anchors) {
        this._anchors.set(val);
    }

    get offset (): Thickness {
        return this._offset;
    }

    set offset (val) {
        this._offset.set(val);
    }

    get pivot () {
        return this._pivot;
    }

    set pivot (val) {
        this._pivot.set(val);
    }

    constructor (anchors: Anchors, offsets: Thickness, pivot: Vec2) {
        super();
        this._anchors = anchors;
        this._offset = offsets;
        this._pivot = pivot;
    }

    public equals(other: AnchorData): boolean {
        return this._anchors.equals(other._anchors) 
            && this._offset.equals(other._offset)
            && this._pivot.equals(other._pivot);
    }

    public set(other: AnchorData): void {
        this._anchors.set(other._anchors);
        this._offset.set(other._offset);
        this._pivot.set(other._pivot);
    }
}