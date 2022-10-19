import { UIElement } from "../../cocos/new-ui/base/ui-element";

test('hierarchy', () => {
    const parent = new UIElement();
    const child1 = new UIElement();
    const child2 = new UIElement();
    parent.addChild(child1);
    parent.addChild(child2);

    expect(parent.children.length).toBe(2);
    expect(child1.parent).toBe(parent);
    expect(child2.parent).toBe(parent);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);

    expect(() => parent.addChild(child1)).toThrowError();

    const child3 = new UIElement();
    parent.addChild(child3);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
    expect(parent.children[2]).toBe(child3);

    parent.removeChildAt(0);
    expect(parent.children.length).toBe(2);
    expect(child1.parent).toBeNull();
    expect(parent.children[0]).toBe(child2);
    expect(parent.children[1]).toBe(child3);

    expect(() => parent.removeChild(child1)).toThrowError();
    parent.removeChild(child2);
    expect(parent.children.length).toBe(1);
    expect(child2.parent).toBeNull();
    expect(parent.children[0]).toBe(child3);

    expect(() => parent.removeChildAt(1)).toThrowError();
    parent.removeChildAt(0);
    expect(parent.children.length).toBe(0);
    expect(child3.parent).toBeNull();

    parent.addChild(child1);
    parent.insertChildAt(child2, 0);
    expect(parent.children.length).toBe(2);
    expect(parent.children[0]).toBe(child2);
    expect(parent.children[1]).toBe(child1);
    expect(child2.parent).toBe(parent);
    expect(child1.parent).toBe(parent);
    parent.insertChildAt(child3, 1);
    expect(parent.children.length).toBe(3);
    expect(parent.children[0]).toBe(child2);
    expect(parent.children[1]).toBe(child3);
    expect(parent.children[2]).toBe(child1);
    expect(child3.parent).toBe(parent);

    const child4 = new UIElement();
    const child5 = new UIElement();
    child4.addChild(child5);
    child3.addChild(child4);
    expect(child4.children.length).toBe(1);
    expect(child4.children[0]).toBe(child5);
    expect(child3.children.length).toBe(1);
    expect(child3.children[0]).toBe(child4);
});
