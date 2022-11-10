import { VisualProxy } from '../../cocos/new-ui/rendering/visual-proxy';

test ('visual hierarchy', () => {
    const visualProxy = new VisualProxy();
    const visualProxyChild = new VisualProxy();
    const visualProxyChild2 = new VisualProxy();

    visualProxy.addChild(visualProxyChild);
    visualProxy.addChild(visualProxyChild2);

    expect(visualProxy.parent).toBe(null);
    expect(visualProxy.children).toBe(visualProxyChild);
    expect(visualProxy.nextSibling).toBe(null);

    expect(visualProxyChild.parent).toBe(visualProxy);
    expect(visualProxyChild2.parent).toBe(visualProxy);
    expect(visualProxyChild.nextSibling).toBe(visualProxyChild2);
    expect(visualProxyChild2.nextSibling).toBe(null);
    expect(visualProxyChild.children).toBe(null);
    expect(visualProxyChild2.children).toBe(null);

    visualProxy.removeChild(visualProxyChild);
    expect(visualProxyChild.parent).toBe(null);
    expect(visualProxy.children).toBe(visualProxyChild2);
    expect(visualProxyChild.nextSibling).toBe(null);

    visualProxy.removeChild(visualProxyChild2);
    expect(visualProxyChild2.parent).toBe(null);
    expect(visualProxy.children).toBe(null);
    expect(visualProxyChild2.nextSibling).toBe(null);

    visualProxy.addChild(visualProxyChild2);
    visualProxy.addChild(visualProxyChild);

    const visualProxyChild3 = new VisualProxy();

    visualProxy.addChild(visualProxyChild3);

    expect(visualProxyChild2.parent).toBe(visualProxy);
    expect(visualProxy.children).toBe(visualProxyChild2);
    expect(visualProxyChild2.nextSibling).toBe(visualProxyChild);
    expect(visualProxyChild.parent).toBe(visualProxy);
    expect(visualProxyChild.nextSibling).toBe(visualProxyChild3);
    expect(visualProxyChild3.parent).toBe(visualProxy);
    expect(visualProxyChild3.nextSibling).toBe(null);

    visualProxy.removeChild(visualProxyChild);
    expect(visualProxyChild.parent).toBe(null);
    expect(visualProxyChild.nextSibling).toBe(null);
    expect(visualProxyChild2.nextSibling).toBe(visualProxyChild3);

    visualProxy.clearChildren();
    expect(visualProxy.children).toBe(null);
    expect(visualProxyChild.nextSibling).toBe(null);
    expect(visualProxyChild.parent).toBe(null);
    expect(visualProxyChild2.nextSibling).toBe(null);
    expect(visualProxyChild2.parent).toBe(null);
    expect(visualProxyChild3.nextSibling).toBe(null);
    expect(visualProxyChild3.parent).toBe(null);
});