import { toBindingIdentifierName } from "@babel/types";
import { Rect, Size, Vec2 } from "../../cocos/core";
import { Thickness } from "../../cocos/new-ui/base/thickness";
import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { UIElement } from "../../cocos/new-ui/base/ui-element";
import { ContentControl } from "../../cocos/new-ui/framework/content-control";
import { ContentSlot, HorizontalAlignment, VerticalAlignment } from "../../cocos/new-ui/framework/content-slot";

class FixedContentElement extends UIElement {
    private _width = 0;
    private _height = 0;
    get width () {
        return this._width;
    }

    set width (val) {
        this._width = val;
        this.invalidateMeasure();
    }

    get height () {
        return this._height;
    }

    set height (val) {
        this._height = val;
        this.invalidateMeasure();
    }

    computeDesiredSize () {
        return new Size(this._width, this._height);
    }
}

test('measure', () => {
    const parent = new ContentControl();
    const content = new FixedContentElement();
    parent.content = content;
    content.width = content.height = 100;
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(100, 100));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));
    content.margin = new Thickness(20, 10, 10, 10);
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(130, 120));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));

    content.margin = new Thickness(0, 0, 0, 0);
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(100, 100));
    expect(parent.content.desiredSize).toStrictEqual(new Size(100, 100));
    content.width = 150;
    content.height = 120;
    content.margin = new Thickness(15, -10, -7, 9);
    parent.measure();
    expect(content.desiredSize).toStrictEqual(new Size(150, 120));
    expect(parent.desiredSize).toStrictEqual(new Size(158, 119));

    const content2 = new FixedContentElement();
    content2.width = content2.height = 20;
    parent.content = content2;
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(20, 20));
    expect(content2.desiredSize).toStrictEqual(new Size(20, 20));

    parent.content = null;
    parent.measure();
    content2.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(0, 0));
    expect(content2.desiredSize).toStrictEqual(new Size(20, 20));

    content2.width = content2.height = 50;
    const parent2 = new ContentControl();
    parent2.content = content2;
    parent2.measure();
    expect(parent2.desiredSize).toStrictEqual(new Size(50, 50));
    expect(content2.desiredSize).toStrictEqual(new Size(50, 50));

    parent.content = parent2.content;
    parent.measure();
    parent2.measure();
    expect(parent.content).toBe(content2);
    expect(parent2.content).toBe(null);
    expect(parent2.desiredSize).toStrictEqual(new Size(0, 0));
    expect(parent.desiredSize).toStrictEqual(new Size(50, 50));
    expect(content2.desiredSize).toStrictEqual(new Size(50, 50));
});

test('arrange', () => {
    const parent = new ContentControl();
    const content = new FixedContentElement();
    content.width = content.height = 100;
    parent.content = content;
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.STRETCH;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.STRETCH;
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(50, 50)));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));
    expect(content.layout.size).toStrictEqual(new Size(50, 50));
    expect(content.layout.center).toStrictEqual(new Vec2(0, 0));
    expect(parent.layout.center).toStrictEqual(new Vec2(0, 0));
    expect(parent.layout.size).toStrictEqual(new Size(50, 50));
    content.margin = new Thickness(15, 15, 5, 5);
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(10, 20), new Size(50, 50)));
    expect(content.layout.size).toStrictEqual(new Size(30, 30));
    expect(content.layout.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layout.center).toStrictEqual(new Vec2(10, 20));
    expect(parent.layout.size).toStrictEqual(new Size(50, 50));
    content.width = 20;
    content.height = 20;
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(50, 50)));
    expect(content.layout.size).toStrictEqual(new Size(30, 30));
    expect(content.layout.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layout.center).toStrictEqual(new Vec2(0, 0));
    expect(parent.layout.size).toStrictEqual(new Size(50, 50));

    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(10, 5), new Size(200, 100)));
    expect(content.layout.size).toStrictEqual(new Size(180, 80));
    expect(content.layout.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layout.center).toStrictEqual(new Vec2(10, 5));
    expect(parent.layout.size).toStrictEqual(new Size(200, 100));

    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.CENTER;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.CENTER;

    content.width = 100;
    content.height = 100;
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(-20, -5), new Size(80, 80)));
    expect(content.layout.size).toStrictEqual(new Size(100, 100));
    expect(content.layout.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layout.center).toStrictEqual(new Vec2(-20, -5));
    expect(parent.layout.size).toStrictEqual(new Size(80, 80));

    //       _______________
    //      ||    |         |
    //      ||____|         |
    //      |               |
    //      |_______________|

    content.width = 20;
    content.height = 20;
    content.margin = new Thickness(10, 5, 5, 3);
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.LEFT;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.TOP;

    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.layout.size).toStrictEqual(new Size(20, 20));
    expect(content.layout.center).toStrictEqual(new Vec2(-20, 25));

    //       _______________
    //      |   |       |   |
    //      |   |       |   |
    //      |   |_______|   |
    //      |_______________|


    content.width = 50;
    content.height = 50;
    content.margin = new Thickness(-8, 10, 7, 3);
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.CENTER;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.TOP;

    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.layout.size).toStrictEqual(new Size(50, 50));
    expect(content.layout.center).toStrictEqual(new Vec2(-7.5, 5));

    //    __________________
    //   |  |               |
    //   |  |               |
    //   |  |               |
    //   |  |_______________|
    //   |__________________|
    //   

    content.width = 100;
    content.height = 100;
    content.margin = new Thickness(4, 2, 2, 5);
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.RIGHT;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.TOP;

    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.layout.size).toStrictEqual(new Size(100, 100));
    expect(content.layout.center).toStrictEqual(new Vec2(-12, -12));

    //       _______________
    //      | ____          |
    //      ||    |         |
    //      ||____|         |
    //      |_______________|

    content.width = 40;
    content.height = 40;
    content.margin = new Thickness(10, 5, 5, 3);
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.LEFT;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.CENTER;

    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.layout.size).toStrictEqual(new Size(40, 40));
    expect(content.layout.center).toStrictEqual(new Vec2(-10, -1));

    //             ____
    //       _____|____|____
    //      |     |    |    |
    //      |     |    |    |
    //      |     |    |    |
    //      |_____|____|____|
    //            |____|

    content.width = 40;
    content.height = 100;
    content.margin = new Thickness(10, 0, 5, -10);
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.CENTER;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.CENTER;

    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.layout.size).toStrictEqual(new Size(40, 100));
    expect(content.layout.center).toStrictEqual(new Vec2(2.5, -5));


    //             
    //       _______________
    //      |          _____|_
    //      |         |     | |
    //      |         |_____|_|
    //      |_______________|
    //          

    content.width = 60;
    content.height = 40;
    content.margin = new Thickness(5, 2, -10, 5);
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.RIGHT;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.CENTER;

    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.layout.size).toStrictEqual(new Size(60, 40));
    expect(content.layout.center).toStrictEqual(new Vec2(20, 1.5));

});


test('auto layout', () => {
    const document = new UIDocument();
    document.viewport = new Rect(0, 0, 960, 640);
    const content = new ContentControl();
    const fixedSizeContent = new FixedContentElement();
    content.addChild(fixedSizeContent);
    fixedSizeContent.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.LEFT;
    fixedSizeContent.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.TOP;
    fixedSizeContent.width = fixedSizeContent.height = 100;
    document.window.addChild(content);
    content.getBehavior(ContentSlot)!.horizontalAlignment = HorizontalAlignment.STRETCH;
    content.getBehavior(ContentSlot)!.verticalAlignment = VerticalAlignment.STRETCH;
    content.margin = new Thickness(10, 10, 10, 10);
    document.update();

    expect(content.layout.size).toStrictEqual(new Size(940, 620));
    expect(content.layout.origin).toStrictEqual(new Vec2(-470, -310));
    expect(fixedSizeContent.layout.size).toStrictEqual(new Size(100, 100));
    expect(fixedSizeContent.layout.center).toStrictEqual(new Vec2(-420, 260));
});