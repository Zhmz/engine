import { Mat4, Scene, Vec3 } from "../../cocos/core";
import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { UIElement } from "../../cocos/new-ui/base/ui-element";
import { UISlot } from "../../cocos/new-ui/base/ui-slot";
import { ContentSlot } from "../../cocos/new-ui/framework/content-slot";
import { Node } from '../../cocos/core/scene-graph';

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
    class SingleChildElement extends UIElement {
        protected allowMultipleChild () {
            return false;
        }

        protected getSlotClass () {
            return ContentSlot;
        }
    }
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
});

test('render-transform', () => {

    class SingleChildElement extends UIElement {
        protected allowMultipleChild () {
            return false;
        }

        protected getSlotClass () {
            return ContentSlot;
        }
    }
    const document = new UIDocument();
    const child1 = new SingleChildElement();
    document.window.addChild(child1);
    expect(document.window.worldTransform.equals(Mat4.IDENTITY)).toBeTruthy();
    child1.position = new Vec3(10, 3.5, -2.4);
    child1.eulerAngles = new Vec3(47.5, 23, -3);
    child1.scale = new Vec3(2, 0.5, 1);
    let child2 = new SingleChildElement();
    child2.position = new Vec3(5, -10, 3);
    child2.eulerAngles = new Vec3(0, 90, 45);
    child2.scale = new Vec3(1, 1, 2);
    child1.addChild(child2);

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

    expect(child1.worldTransform.equals(node.worldMatrix));
    expect(child2.worldTransform.equals(node2.worldMatrix));
});


