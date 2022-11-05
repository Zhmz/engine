import { Vec2 } from "../../cocos/core/math";
import { EventMouse } from "../../cocos/input/types";
import { UIButton } from "../../cocos/new-ui/component/ui-button";
import { EventTarget } from '../../cocos/core/event';
import { pointerInputModule } from "../../cocos/new-ui/event-system/input-modules/pointer-input-module";
import { UIElement } from "../../cocos/new-ui/base/ui-element";
import { Button } from "../../cocos/new-ui/framework/button";
import { UIWindow } from "../../cocos/new-ui/base/ui-window";
import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { PointerClickEvent, PointerDownEvent, PointerUpEvent } from "../../cocos/new-ui/event-system/event-data/pointer-event";
import exp from "constants";
import { UISystem } from "../../cocos/new-ui/base/ui-system";

test('simple-button-mouse-enter', () => {
    const element = new UIElement();
    const document = new UIDocument();
    UISystem.instance.addDocument(document);
    const window = document.window;
    document.window.addChild(element);

    // const eventPointerDown = new PointerDownEvent(element);
    // const eventPointerUp = new PointerUpEvent(element);
    // const eventPointerClick = new PointerClickEvent(element);

    const fnDown =  jest.fn(function (evt) {
        expect(this).toBe(element);
    })
    const fnUp = jest.fn(function (evt) {
        expect(this).toBe(element);
    })
    const fnClick = jest.fn(function (evt) {
        expect(this).toBe(element);
    })

    element.addEventListener(PointerDownEvent, fnDown, element);
    element.addEventListener(PointerUpEvent, fnUp, element);
    element.addEventListener(PointerClickEvent, fnClick, element);

    // @ts-expect-error access private method
    const eventTarget: EventTarget = pointerInputModule.mouseInput._eventTarget;

    const eventMouseDownStr = 'mouse-down';
    const eventMouseDown = new EventMouse(eventMouseDownStr, false, Vec2.ZERO);
    eventMouseDown.setLocation(0, 0);
    eventMouseDown.setButton(0);
    eventMouseDown.movementX = 0;
    eventMouseDown.movementY = 0;

    eventTarget.emit(eventMouseDownStr, eventMouseDown);
    expect(fnDown).toBeCalledTimes(1);

    const eventMouseUpStr = 'mouse-up';
    const eventMouseUp = new EventMouse(eventMouseUpStr, false, Vec2.ZERO);
    eventMouseUp.setLocation(0, 0);
    eventMouseUp.setButton(0);
    eventMouseUp.movementX = 0;
    eventMouseUp.movementY = 0;
    
    eventTarget.emit(eventMouseUpStr, eventMouseUp);
    expect(fnClick).toBeCalledTimes(1);
    eventTarget.emit(eventMouseUpStr, eventMouseUp);
    expect(fnUp).toBeCalledTimes(1);


    // debug in UIButton and observe whether OnMouseUp or OnMouseDown executes


});



