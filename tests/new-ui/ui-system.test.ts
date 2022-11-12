import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { UISystem } from "../../cocos/new-ui/ui-system";

test('ui-system', () => {
    const uiDocument1 = new UIDocument()
    UISystem.instance.addDocument(uiDocument1);
    expect(UISystem.instance.documents.length).toBe(1);
    const uiDocument2 = new UIDocument;
    UISystem.instance.addDocument(uiDocument2);
    expect(UISystem.instance.documents.length).toBe(2);
    UISystem.instance.removeDocument(new UIDocument());
    expect(UISystem.instance.documents.length).toBe(2);
    UISystem.instance.removeDocument(uiDocument2);
    expect(UISystem.instance.documents.length).toBe(1);
    UISystem.instance.removeDocument(uiDocument1);
    expect(UISystem.instance.documents.length).toBe(0);
});

test('update', () => {
    UISystem.instance.init();
    const uiDocument = new UIDocument();
    UISystem.instance.addDocument(uiDocument);
    const tick = uiDocument.update = jest.fn(() => {});
    UISystem.instance.tick();
    expect(tick).toBeCalledTimes(1);
    UISystem.instance.tick();
    UISystem.instance.tick();
    UISystem.instance.tick();
    expect(tick).toBeCalledTimes(4);
    UISystem.instance.tick();
    expect(tick).toBeCalledTimes(5);
})