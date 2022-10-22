
export class PropertyValueEntry {
    private _propertyId: number;
    private _value: any;

    get value () {
        return this._value;
    }

    set value (val) {
        this._value = val;
    }

    get propertyId () {
        return this._propertyId;
    }

    constructor (propertyId: number, value: any) {
        this._propertyId = propertyId;
        this._value = value;
    }
}