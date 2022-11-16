import { Rect, Vec2, Vec3 } from "../../cocos/core/math";
import { EventMouse } from "../../cocos/input/types";
import { UIButton } from "../../cocos/new-ui/component/ui-button";
import { EventTarget } from '../../cocos/core/event';
import { PointerInputModule } from "../../cocos/new-ui/event-system/input-modules/pointer-input-module";
import { UIElement } from "../../cocos/new-ui/base/ui-element";
import { Button } from "../../cocos/new-ui/framework/button";
import { UIWindow } from "../../cocos/new-ui/base/ui-window";
import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { PointerClickEvent, PointerDownEvent, PointerUpEvent } from "../../cocos/new-ui/event-system/event-data/pointer-event";
import exp from "constants";
import { UISystem } from "../../cocos/new-ui/ui-system";
import { ContainerElement } from "../../cocos/new-ui/base";
import { ContentLayout } from "../../cocos/new-ui/framework";
import { Ray } from "../../cocos/core/geometry";

class SingleChildElement extends ContainerElement {
    public allowMultipleChild () {
        return false;
    }

    public getLayoutClass () {
        return ContentLayout;
    }

    set layoutRect (rect: Readonly<Rect>) {
        super.layoutRect = rect;
    }

    get layoutRect () {
        return super.layoutRect;
    }
}

test('simple-button-mouse-enter', () => {
    UISystem.instance.init();
    const eventSystem  = UISystem.instance.eventSystem;

    const element = new SingleChildElement();
    const document = new UIDocument();
    UISystem.instance.addDocument(document);
    const window = document.window;
    document.window.addChild(element);

    element.renderTransform.position = new Vec3(0, 0, 1);
    element.layoutRect = new Rect(-0.5,-0.5,1,1);

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
    
    //inputModule
    const pointerInputModule = new PointerInputModule(eventSystem);
    // construct a ray and set it in inputModule
    const ray = new Ray();
    ray.d = new Vec3(0,0.25,1);
    ray.o = new Vec3(0,0,-1);
    pointerInputModule.ray = ray;

    eventSystem.inputModule = pointerInputModule;
    // @ts-expect-error access private method
    const eventTarget: EventTarget = eventSystem.inputModule.mouseInput._eventTarget;

    // event data
    const eventMouseDownStr = 'mouse-down';
    const eventMouseDown = new EventMouse(eventMouseDownStr, false, Vec2.ZERO);
    eventMouseDown.setLocation(1, 1);
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

    // modify the ray
    ray.d = new Vec3(0,-0.3,1);
    ray.o = new Vec3(0,0,-1);

    // new ray doesn't raycast the element so that the time of down doesn't increase
    eventTarget.emit(eventMouseDownStr, eventMouseDown);
    expect(fnDown).toBeCalledTimes(1);
});



