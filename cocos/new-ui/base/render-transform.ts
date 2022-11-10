import { approx, Mat4, Quat, Vec2, Vec3 } from '../../core';
import { AdvancedProperty } from './advanced-property';
import { UIBehavior } from './ui-behavior';

export class RenderTransform extends UIBehavior {
    public static PositionProperty = AdvancedProperty.register('Position', Vec3, RenderTransform, Vec3.ZERO);
    public static RotationProperty = AdvancedProperty.register('Rotation', Quat, RenderTransform, Quat.IDENTITY);
    public static ScaleProperty = AdvancedProperty.register('Scale', Vec3, RenderTransform, Vec3.ONE);
    public static ShearProperty = AdvancedProperty.register('Shear', Vec2, RenderTransform, Vec2.ZERO);
    public static PivotProperty = AdvancedProperty.register('Pivot', Vec2, RenderTransform, Object.freeze(new Vec2(0.5, 0.5)));

    get position () {
        return this.getValue(RenderTransform.PositionProperty) as Vec3;
    }

    set position (val: Vec3) {
        this.invalidateLocalTransform();
        this.setValue(RenderTransform.PositionProperty, val.clone());
    }

    get eulerAngles () {
        return Quat.toEuler(new Vec3(), this.rotation) as Vec3;
    }

    set eulerAngles (val: Vec3) {
        const quat = Quat.fromEuler(new Quat(), val.x, val.y, val.z);
        this.rotation = quat;
    }

    get rotation () {
        return this.getValue(RenderTransform.RotationProperty) as Quat;
    }

    set rotation (val: Quat) {
        this.invalidateLocalTransform();
        this.setValue(RenderTransform.RotationProperty, val.clone());
    }

    get shear () {
        return this.getValue(RenderTransform.ShearProperty) as Vec2;
    }

    set shear (val: Vec2) {
        this.invalidateLocalTransform();
        this.setValue(RenderTransform.ShearProperty, val);
    }

    get scale () {
        return this.getValue(RenderTransform.ScaleProperty) as Vec3;
    }

    set scale (val: Vec3) {
        this.invalidateLocalTransform();
        this.setValue(RenderTransform.ScaleProperty, val.clone());
    }

    get pivot () {
        return this.getValue(RenderTransform.PivotProperty) as Vec2;
    }

    set pivot (val: Vec2) {
        this.element.invalidateWorldTransform();
        this.setValue(RenderTransform.PivotProperty, val.clone());
    }

    get matrix () {
        if (this._localTransformDirty) {
            const { x: shearX, y: shearY } = this.shear;
            if (approx(shearX, 0) && approx(shearY, 0)) {
                Mat4.fromRTS(this._matrix, this.rotation, this.position, this.scale);
            } else {
                // apply order: scale -> shear -> rotation -> translation
                Mat4.fromScaling(this._matrix, this.scale);
                const tempMat = new Mat4();
                tempMat.m01 = shearY;
                tempMat.m04 = shearX;
                Mat4.multiply(this._matrix, tempMat, this._matrix);
                Mat4.fromRT(tempMat, this.rotation, this.position);
                Mat4.multiply(this._matrix, tempMat, this._matrix);
            }
            this._localTransformDirty = false;
        }
        return this._matrix;
    }

    private invalidateLocalTransform () {
        this._localTransformDirty = true;
        this.element.invalidateWorldTransform();
    }

    private _matrix = new Mat4();
    private _localTransformDirty = false;
}
