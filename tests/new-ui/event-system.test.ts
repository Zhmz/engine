import { Vec2 } from "../../cocos/core/math";
import { EventMouse } from "../../cocos/input/types";
import { UIButton } from "../../cocos/new-ui/component/ui-button";
import { EventTarget } from '../../cocos/core/event';
import { eventSystem } from "../../cocos/new-ui/event-system/event-system";
import { PointerInputModule } from "../../cocos/new-ui/event-system/input-modules/pointer-input-module";
import { UIElement } from "../../cocos/new-ui/base/ui-element";
import { Button } from "../../cocos/new-ui/framework/button";

test('simple-button-mouse-enter', () => {
    const pointerInputModule = new PointerInputModule();
    //pointerInputModule.registerNodeEventProcessor();

    const button = new Button();
    // for change timing forcedly in unit test, it is not permitted in real runtime.

    // @ts-expect-error access private method
    const eventTarget: EventTarget = eventSystem.mouseInput._eventTarget;

    const eventMouseUpStr = 'mouse-up';
    const eventMouseUp = new EventMouse(eventMouseUpStr, false, Vec2.ZERO);
    eventMouseUp.setLocation(0, 0);
    eventMouseUp.setButton(0);
    eventMouseUp.movementX = 0;
    eventMouseUp.movementY = 0;
    eventTarget.emit(eventMouseUpStr, eventMouseUp);
    expect(Button.MOUSE_UP_COUNTER).toBe(1);
    eventTarget.emit(eventMouseUpStr, eventMouseUp);
    expect(Button.MOUSE_UP_COUNTER).toBe(2);

    const eventMouseDownStr = 'mouse-down';
    const eventMouseDown = new EventMouse(eventMouseDownStr, false, Vec2.ZERO);
    eventMouseDown.setLocation(0, 0);
    eventMouseDown.setButton(0);
    eventMouseDown.movementX = 0;
    eventMouseDown.movementY = 0;
    eventTarget.emit(eventMouseDownStr, eventMouseDown);
    expect(Button.MOUSE_DOWN_COUNTER).toBe(1);
    eventTarget.emit(eventMouseDownStr, eventMouseDown);
    expect(Button.MOUSE_DOWN_COUNTER).toBe(2);

    // debug in UIButton and observe whether OnMouseUp or OnMouseDown executes


});



