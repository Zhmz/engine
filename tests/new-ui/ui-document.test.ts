import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { UIElement } from "../../cocos/new-ui/base/ui-element";

test('ui-document', () => {
    const document = new UIDocument();
    const uiElement = new UIElement();
    document.window.addChild(uiElement);
    expect(uiElement.document).toBe(document);
    expect(document.window.document).toBe(document);
});