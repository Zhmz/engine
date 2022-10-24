import { approx, Mat4, Quat, Rect, Scene, Vec2, Vec3 } from "../../cocos/core";
import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { UIElement } from "../../cocos/new-ui/base/ui-element";
import { UISlot } from "../../cocos/new-ui/base/ui-slot";
import { ContentSlot } from "../../cocos/new-ui/framework/content-slot";
import { Node } from '../../cocos/core/scene-graph';

class SingleChildElement extends UIElement {
    protected allowMultipleChild () {
        return false;
    }

    protected getSlotClass () {
        return ContentSlot;
    }
}


class MultipleChildElement extends UIElement {
    protected allowMultipleChild () {
        return true;
    }

    protected getSlotClass () {
        return ContentSlot;
    }
}

test('slot', () => {
    const element1 = new UIElement();
    expect(() => element1.addChild(new UIElement())).toThrowError();
    expect(element1.children.length).toBe(0);
    expect(() => element1.insertChildAt(new UIElement(), 0)).toThrowError();
    class TestElement extends UIElement {
        protected getSlotClass () {
            return ContentSlot;
        }
    }

    class TestSlot extends UISlot {
        
    }

    class TestElement2 extends UIElement {
        protected getSlotClass () {
            return TestSlot;
        }
    }

    const testElement = new TestElement();
    expect(() => element1.addChild(testElement)).toThrowError();
    testElement.addChild(element1);
    expect(testElement.childCount).toBe(1);
    expect(element1.slot).toBeTruthy();
    expect(element1.slot!.constructor).toBe(ContentSlot);

    testElement.removeChild(element1);
    expect(element1.slot).toBeNull();
    testElement.addChild(element1);
    expect(element1.slot).toBeTruthy();
    expect(element1.slot!.constructor).toBe(ContentSlot);

    const testElement2 = new TestElement2();
    testElement2.addChild(element1);
    expect(element1.slot).toBeTruthy();
    expect(element1.slot!.constructor).toBe(TestSlot);

    testElement2.removeChild(element1);
    expect(element1.slot).toBeNull();
});

test('document', () => {

    const document = new UIDocument();
    const uiElement = new SingleChildElement();
    document.window.addChild(uiElement);
    expect(uiElement.document).toBe(document);

    const childElement2 = new SingleChildElement();
    uiElement.addChild(childElement2);
    expect(childElement2.document).toBe(document);

    document.window.removeChildAt(0);
    expect(uiElement.document).toBeNull();
    expect(childElement2.document).toBeNull();

    document.window.addChild(uiElement);
    expect(uiElement.document).toBe(document);
    expect(childElement2.document).toBe(document);

    uiElement.removeChildAt(0);
    expect(uiElement.document).toBe(document);
    expect(childElement2.document).toBeNull();
});

test('multiple child', () => {

    const singleChildElement = new SingleChildElement();
    singleChildElement.addChild(new UIElement());
    expect(singleChildElement.childCount).toBe(1);
    expect(() => singleChildElement.addChild(new UIElement())).toThrowError();
    expect(singleChildElement.childCount).toBe(1);
    expect(() => singleChildElement.insertChildAt(new UIElement, 0)).toThrowError();
    expect(singleChildElement.childCount).toBe(1);
    singleChildElement.removeChildAt(0);
    expect(singleChildElement.childCount).toBe(0);
    singleChildElement.addChild(new UIElement());
    expect(singleChildElement.childCount).toBe(1);

    const multipleChildElement = new MultipleChildElement();
    multipleChildElement.addChild(new UIElement());
    multipleChildElement.addChild(new UIElement());
    multipleChildElement.addChild(new UIElement());
    expect(multipleChildElement.childCount).toBe(3);

})

test('hierarchy', () => {
    class TestElement extends UIElement {
        protected allowMultipleChild () {
            return true;
        }

        protected getSlotClass () {
            return ContentSlot;
        }
    }

    const parent = new TestElement();
    expect(() => parent.insertChildAt(new TestElement, 0)).toThrowError();
    const child1 = new TestElement();
    const child2 = new TestElement();
    parent.addChild(child1);
    parent.addChild(child2);

    expect(parent.children.length).toBe(2);
    expect(parent.childCount).toBe(parent.children.length);
    expect(child1.parent).toBe(parent);
    expect(child2.parent).toBe(parent);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);

    expect(() => parent.addChild(child1)).toThrowError();

    const child3 = new TestElement();
    parent.addChild(child3);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
    expect(parent.children[2]).toBe(child3);
    expect(parent.children.length).toBe(3);
    expect(parent.childCount).toBe(parent.children.length);

    expect(() => parent.insertChildAt(new TestElement, 3)).toThrowError();

    parent.removeChildAt(0);
    expect(parent.children.length).toBe(2);
    expect(parent.childCount).toBe(parent.children.length);
    expect(child1.parent).toBeNull();
    expect(parent.children[0]).toBe(child2);
    expect(parent.children[1]).toBe(child3);

    expect(() => parent.removeChild(child1)).toThrowError();
    parent.removeChild(child2);
    expect(parent.children.length).toBe(1);
    expect(parent.childCount).toBe(parent.children.length);
    expect(child2.parent).toBeNull();
    expect(parent.children[0]).toBe(child3);

    expect(() => parent.removeChildAt(1)).toThrowError();
    parent.removeChildAt(0);
    expect(parent.children.length).toBe(0);
    expect(parent.childCount).toBe(parent.children.length);
    expect(child3.parent).toBeNull();

    parent.addChild(child1);
    parent.insertChildAt(child2, 0);
    expect(parent.children.length).toBe(2);
    expect(parent.childCount).toBe(parent.children.length);
    expect(parent.children[0]).toBe(child2);
    expect(parent.children[1]).toBe(child1);
    expect(child2.parent).toBe(parent);
    expect(child1.parent).toBe(parent);
    parent.insertChildAt(child3, 1);
    expect(parent.children.length).toBe(3);
    expect(parent.childCount).toBe(parent.children.length);
    expect(parent.children[0]).toBe(child2);
    expect(parent.children[1]).toBe(child3);
    expect(parent.children[2]).toBe(child1);
    expect(child3.parent).toBe(parent);

    const child4 = new TestElement();
    const child5 = new TestElement();
    child4.addChild(child5);
    child3.addChild(child4);
    expect(child4.children.length).toBe(1);
    expect(parent.childCount).toBe(parent.children.length);
    expect(child4.children[0]).toBe(child5);
    expect(child3.children.length).toBe(1);
    expect(child3.children[0]).toBe(child4);
});

test('other', () => {
    class TestElement extends UIElement {
        protected allowMultipleChild () {
            return true;
        }

        protected getSlotClass () {
            return ContentSlot;
        }
    }

    const testElement = new TestElement();
    const childElement1 = new TestElement();
    const childElement2 = new TestElement();
    testElement.addChild(childElement1);
    testElement.addChild(childElement2);
    expect(testElement.getChildIndex(childElement2)).toBe(1);
    expect(testElement.getChildAt(1)).toBe(childElement2);


    expect(testElement.childCount).toBe(2);
    expect(childElement1.parent).toBe(testElement);
    expect(childElement2.parent).toBe(testElement);
    expect(childElement1.slot).toBeTruthy();
    expect(childElement2.slot).toBeTruthy();

    testElement.clearChildren();
    expect(testElement.childCount).toBe(0);
    expect(childElement1.parent).toBe(null);
    expect(childElement2.parent).toBe(null);
    expect(childElement1.slot).toBeFalsy();
    expect(childElement2.slot).toBeFalsy();

    testElement.addChild(childElement1);
    // change parent
    const testElement2 = new TestElement();
    testElement2.addChild(childElement1);
    expect(childElement1.parent).toBe(testElement2);
    expect(testElement.childCount).toBe(0);
    expect(testElement2.childCount).toBe(1);

    // removeFromParent
    const testElement3 = new TestElement();
    testElement3.addChild(childElement1);
    expect(childElement1.parent).toBe(testElement3);
    expect(testElement2.childCount).toBe(0);
    expect(testElement3.childCount).toBe(1);

    childElement1.removeFromParent();
    expect(testElement3.childCount).toBe(0);
    expect(childElement1.parent).toBe(null);
});

test('render-transform', () => {

    const document = new UIDocument();
    const child1 = new SingleChildElement();
    document.window.addChild(child1);
    let child2 = new SingleChildElement();
    child1.addChild(child2);
    expect(document.window.worldTransform.equals(Mat4.IDENTITY)).toBeTruthy();
    expect(child1.worldTransform.equals(Mat4.IDENTITY)).toBeTruthy();

    child1.position = new Vec3(20, 50, 100);
    child1.rotation = Quat.fromEuler(new Quat, 45, 90, 180);
    child1.scale = new Vec3(0.5, 2, 0.5);
    expect(child1.worldTransform.equals(Mat4.fromRTS(new Mat4, child1.rotation, child1.position , child1.scale))).toBeTruthy();
    expect(child2.worldTransform.equals(Mat4.fromRTS(new Mat4, child1.rotation, child1.position , child1.scale))).toBeTruthy();
    expect(child2.worldTransform.m12).toBe(20);
    expect(child2.worldTransform.m13).toBe(50);
    expect(child2.worldTransform.m14).toBe(100);

    child2.position = new Vec3(-10, 20, -90);
    child1.rotation = Quat.fromEuler(new Quat, 0, 0, 0);
    child1.scale = new Vec3(1, 1, 1);
    expect(child1.worldTransform.m12).toBe(20);
    expect(child1.worldTransform.m13).toBe(50);
    expect(child1.worldTransform.m14).toBe(100);
    expect(child2.worldTransform.m12).toBe(10);
    expect(child2.worldTransform.m13).toBe(70);
    expect(child2.worldTransform.m14).toBe(10);

    child2.rotation = Quat.fromEuler(new Quat, 45, 90, 180);
    child1.scale = new Vec3(0.1, 1.5, 0.1);

    expect(child1.worldTransform.equals(Mat4.fromRTS(new Mat4, child1.rotation, child1.position , child1.scale))).toBeTruthy();
    expect(child2.worldTransform.equals(Mat4.multiply(new Mat4, child1.worldTransform, Mat4.fromRTS(new Mat4, child2.rotation, child2.position , child2.scale)))).toBeTruthy();

    child1.position = new Vec3(10, 3.5, -2.4);
    child1.eulerAngles = new Vec3(47.5, 23, -3);
    child1.scale = new Vec3(2, 0.5, 1);
    child2.position = new Vec3(5, -10, 3);
    child2.eulerAngles = new Vec3(0, 90, 45);
    child2.scale = new Vec3(1, 1, 2);

    const scene = new Scene('test');
    const node = new Node();
    scene.addChild(node)
    node.position = new Vec3(10, 3.5, -2.4);
    node.eulerAngles = new Vec3(47.5, 23, -3);
    node.scale = new Vec3(2, 0.5, 1);
    let node2 = new Node();
    node2.position = new Vec3(5, -10, 3);
    node2.eulerAngles = new Vec3(0, 90, 45);
    node2.scale = new Vec3(1, 1, 2);
    node.addChild(node2);

    expect(child1.worldTransform.equals(node.worldMatrix)).toBeTruthy();
    expect(child2.worldTransform.equals(node2.worldMatrix)).toBeTruthy();

    child1.position = new Vec3(20, 0.5, -10);
    child1.eulerAngles = new Vec3(165.5, 90, 37);
    child1.scale = new Vec3(0.2, -0.1, 0.77);
    child2.position = new Vec3(100, -25, 0.3);
    child2.eulerAngles = new Vec3(55, 97, 180);
    child2.scale = new Vec3(-1, -1, -1);

    node.position = new Vec3(20, 0.5, -10);
    node.eulerAngles = new Vec3(165.5, 90, 37);
    node.scale = new Vec3(0.2, -0.1, 0.77);
    node2.position = new Vec3(100, -25, 0.3);
    node2.eulerAngles = new Vec3(55, 97, 180);
    node2.scale = new Vec3(-1, -1, -1);

    expect(child1.worldTransform.equals(node.worldMatrix)).toBeTruthy();
    expect(child2.worldTransform.equals(node2.worldMatrix)).toBeTruthy();

    // no parent element
    const child3 = new SingleChildElement();
    child3.position = new Vec3(200, 0.1, -0.99);
    child3.eulerAngles = new Vec3(47.5, 23, -3);
    child3.scale = new Vec3(2, 0.5, 1);

    const node3 = new Node();
    node3.position = new Vec3(200, 0.1, -0.99);
    node3.eulerAngles = new Vec3(47.5, 23, -3);
    node3.scale = new Vec3(2, 0.5, 1);

    expect(child3.worldTransform.equals(node3.worldMatrix)).toBeTruthy();
    expect(child3.worldTransform.equals(Mat4.IDENTITY)).toBeFalsy();
    
    const child4 = new SingleChildElement();
    child4.position = new Vec3(3, 9, 0);
    child4.eulerAngles = new Vec3(45, 17, 30);
    child4.scale = new Vec3(-7, 0.2, 10);
    child3.addChild(child4);

    const node4 = new Node();
    node4.position = new Vec3(3, 9, 0);
    node4.eulerAngles = new Vec3(45, 17, 30);
    node4.scale = new Vec3(-7, 0.2, 10);
    node3.addChild(node4);

    expect(child4.worldTransform.equals(node4.worldMatrix)).toBeTruthy();
    expect(child4.worldTransform.equals(Mat4.IDENTITY)).toBeFalsy();
});

test('layout-transform', () => {
    
    const document = new UIDocument();
    const element = new SingleChildElement();
    expect(element.worldTransform.m12).toBe(0);
    expect(element.worldTransform.m13).toBe(0);
    element.layout = new Rect(20, 10, 100, 200);
    document.window.addChild(element);
    expect(element.worldTransform.m12).toBe(20);
    expect(element.worldTransform.m13).toBe(10);
    expect(element.worldTransform.m14).toBe(0);
    element.layout = new Rect(10, 20, 0, 0);
    expect(element.worldTransform.m12).toBe(10);
    expect(element.worldTransform.m13).toBe(20);
    expect(element.worldTransform.m14).toBe(0);

    const element2 = new SingleChildElement();
    element.addChild(element2);
    expect(element2.worldTransform.m12).toBe(10);
    expect(element2.worldTransform.m13).toBe(20);
    expect(element2.worldTransform.m14).toBe(0);
    element2.layout = new Rect(-10, -10, 200, 50);
    expect(element2.worldTransform.m12).toBe(0);
    expect(element2.worldTransform.m13).toBe(10);
    expect(element2.worldTransform.m14).toBe(0);

    element.layout = new Rect(0, 0, 0, 0);
    expect(element2.worldTransform.m12).toBe(-10);
    expect(element2.worldTransform.m13).toBe(-10);
    expect(element2.worldTransform.m14).toBe(0);
});

test('world-transform', () => {
    // only position and layout
    const document = new UIDocument();
    const element = new SingleChildElement();
    element.layout = new Rect(20, 10, 100, 200);
    element.position = new Vec3(10, 50, -5);
    document.window.addChild(element);
    expect(element.worldTransform.m12).toBe(30);
    expect(element.worldTransform.m13).toBe(60);
    expect(element.worldTransform.m14).toBe(-5);
    element.layout = new Rect(10, 20, 0, 0);
    element.position = new Vec3(-10, -20, 0);
    expect(element.worldTransform.m12).toBe(0);
    expect(element.worldTransform.m13).toBe(0);
    expect(element.worldTransform.m14).toBe(0);

    const element2 = new SingleChildElement();
    element.addChild(element2);
    expect(element2.worldTransform.m12).toBe(0);
    expect(element2.worldTransform.m13).toBe(0);
    expect(element2.worldTransform.m14).toBe(0);

    element.position = new Vec3(5, 5, 5);
    element.layout = new Rect(7, 5, 2, 2);
    element2.position = new Vec3(30, 20, 10);
    element2.layout = new Rect(-10, -15, 0, 0);
    expect(element2.worldTransform.m12).toBe(32);
    expect(element2.worldTransform.m13).toBe(15);
    expect(element2.worldTransform.m14).toBe(15);

    // apply all transform

    element.layout = new Rect(-10, -20, 200, 100);
    element.position = new Vec3(5, 10, -5);
    element.rotation = Quat.fromEuler(new Quat, 45, 100, 75);
    element.scale = new Vec3(1.2, 1.5, 0.7);

    const scene = new Scene('test');
    const layoutNode = new Node('layout');
    layoutNode.position = new Vec3(-10, -20, 0);
    scene.addChild(layoutNode);
    const transformNode = new Node('transform');
    transformNode.position = new Vec3(5, 10, -5);
    transformNode.rotation = Quat.fromEuler(new Quat, 45, 100, 75);
    transformNode.scale = new Vec3(1.2, 1.5, 0.7);
    layoutNode.addChild(transformNode);

    expect(element.worldTransform.equals(transformNode.worldMatrix)).toBeTruthy();

    element2.layout = new Rect(5, 25, 100, 50);
    element2.position = new Vec3(5, 7, 8);
    element2.eulerAngles = new Vec3(75, 108,160);
    element2.scale = new Vec3(0.2, 0.1, 0.3);

    const layoutNode2 = new Node('layout2');
    layoutNode2.position = new Vec3(5, 25, 0);
    transformNode.addChild(layoutNode2);
    const transformNode2 = new Node('transform2');
    transformNode2.position = new Vec3(5, 7, 8);
    transformNode2.eulerAngles = new Vec3(75, 108,160);
    transformNode2.scale = new Vec3(0.2, 0.1, 0.3);
    layoutNode2.addChild(transformNode2);

    expect(element2.worldTransform.equals(transformNode2.worldMatrix)).toBeTruthy();

    element.layout = new Rect(10, -10, 100, 50);
    element.position = new Vec3(0.5, -0.7, 1);
    element.eulerAngles = new Vec3(0, 90, 65);
    element.scale = new Vec3(0.5, 0.1, 0.2);

    layoutNode.position = new Vec3(10, -10, 0);
    transformNode.position = new Vec3(0.5, -0.7, 1);
    transformNode.eulerAngles = new Vec3(0, 90, 65);
    transformNode.scale = new Vec3(0.5, 0.1, 0.2);

    expect(element2.worldTransform.equals(transformNode2.worldMatrix)).toBeTruthy();

});

test('world-transform with pivot', () => {
    const document = new UIDocument();
    const element = new SingleChildElement();
    element.layout = new Rect(20, 10, 100, 200);
    element.position = new Vec3(10, 50, -5);
    element.renderTransformPivot = new Vec2(0, 0);
    document.window.addChild(element);
    const element2 = new SingleChildElement();
    element.addChild(element2);
    expect(element.worldTransform.m12).toBe(30);
    expect(element.worldTransform.m13).toBe(60);
    expect(element.worldTransform.m14).toBe(-5);
    element.layout = new Rect(20, 10, 0, 0);
    expect(element.worldTransform.m12).toBe(30);
    expect(element.worldTransform.m13).toBe(60);
    expect(element.worldTransform.m14).toBe(-5);
    element.renderTransformPivot = new Vec2(1, 1);
    expect(element.worldTransform.m12).toBe(30);
    expect(element.worldTransform.m13).toBe(60);
    expect(element.worldTransform.m14).toBe(-5);
    element.layout = new Rect(10, 20, 0, 0);
    element.position = new Vec3(-10, -20, 0);
    element.renderTransformPivot = new Vec2(0.2, 0.2);
    expect(element.worldTransform.m12).toBe(0);
    expect(element.worldTransform.m13).toBe(0);
    expect(element.worldTransform.m14).toBe(0);

    element.layout = new Rect(20, 10, 100, 200);
    element.position = new Vec3(10, 50, -5);
    element.eulerAngles = new Vec3(0, 0, -45);
    element.renderTransformPivot = new Vec2(0, 0);
    expect(approx(element.worldTransform.m12, 86.066017)).toBeTruthy();
    expect(approx(element.worldTransform.m13, -4.6446609)).toBeTruthy();
    expect(element.worldTransform.m14).toBe(-5);
    expect((Quat.toEuler(new Vec3(), element.worldTransform.getRotation(new Quat)) as Vec3).equals(new Vec3(0, 0, -45))).toBeTruthy();

    element.renderTransformPivot = new Vec2(1, 1);
    expect(element.worldTransform.m12).toBeCloseTo(-26.06601);
    expect(element.worldTransform.m13).toBeCloseTo(124.6447);
    expect(element.worldTransform.m14).toBe(-5);
    expect((Quat.toEuler(new Vec3(), element.worldTransform.getRotation(new Quat)) as Vec3).equals(new Vec3(0, 0, -45))).toBeTruthy();

    element.eulerAngles = new Vec3(0, 0, -90);
    expect(element.worldTransform.m12).toBeCloseTo(-20, 6);
    expect(element.worldTransform.m13).toBeCloseTo(210, 6);
    expect(element.worldTransform.m14).toBe(-5);
    expect((Quat.toEuler(new Vec3(), element.worldTransform.getRotation(new Quat)) as Vec3).equals(new Vec3(0, 0, -90))).toBeTruthy();

    element.scale = new Vec3(1, 2.5, 1);
    expect(element.worldTransform.m12).toBeCloseTo(-170, 5);
    expect(element.worldTransform.m13).toBeCloseTo(210, 6);
    expect(element.worldTransform.m14).toBe(-5);
    expect((Quat.toEuler(new Vec3(), element.worldTransform.getRotation(new Quat)) as Vec3).equals(new Vec3(0, 0, -90))).toBeTruthy();
    expect(element.worldTransform.getScale(new Vec3).equals(new Vec3(1, 2.5, 1))).toBeTruthy();

    element.eulerAngles = new Vec3(0, 0, 45);
    element2.layout = new Rect(5, -5, 100, 100);
    element2.position = new Vec3(20, 30, 5);
    element2.eulerAngles = new Vec3(0, 0, 0);
    element2.scale = new Vec3(2, 0.2, 1.7);
    element2.renderTransformPivot = new Vec2(0.2, 0.3);
    expect(element2.worldTransform.m12).toBeCloseTo(244.402326, 2);
    expect(element2.worldTransform.m13).toBeCloseTo(2.6687, 2);
    expect(element2.worldTransform.m14).toBeCloseTo(0);
    expect(element2.worldTransform.getScale(new Vec3)).toStrictEqual(new Vec3(2, 0.5, 1.7));
    expect(element2.worldTransform.equals(Mat4.fromRTS(new Mat4, Quat.fromEuler(new Quat, 0, 0, 45), new Vec3(244.4023266, 2.66874, 0), new Vec3(2, 0.5, 1.7)))).toBeTruthy();
});

