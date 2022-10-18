

export enum ErrorID {
    UNKNOWN,
    OUT_OF_RANGE,
    INVALID_INPUT,
    ADD_CHILD_ERROR
}

export class UIError extends Error {
    public get id () {
        return this._id;
    }
    
    constructor (id: ErrorID, message?: string) {
        super(message);
        this._id = id;
    }

    private _id = ErrorID.UNKNOWN
}