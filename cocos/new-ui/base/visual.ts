
import { AdvancedObject } from "./advanced-object";
import { IDrawingContext } from "./ui-drawing-context";

export abstract class Visual extends AdvancedObject {
    protected onPaint (drawingContext: IDrawingContext) {}
}