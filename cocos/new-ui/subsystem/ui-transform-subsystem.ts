import { InvalidateReason, UIElement } from '../base/ui-element';
import { UISubSystem } from '../base/ui-subsystem';

export class UITransformSubsystem extends UISubSystem {
    private _dirtyTransformMap = new Set<UIElement>();

    invalidate (element: UIElement, invalidateReason: InvalidateReason) {
        if (invalidateReason & InvalidateReason.TRANSFORM) {
            this._dirtyTransformMap.add(element);
        }
    }

    update () {
        for (const element of this._dirtyTransformMap) {
            element.updateWorldTransform();
        }
        this._dirtyTransformMap.clear();
    }
}
