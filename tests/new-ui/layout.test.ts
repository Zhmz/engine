import { Rect, Size, Vec2 } from "../../cocos/core";
import { RenderMode, UIRuntimeDocumentSettings } from "../../cocos/new-ui/base/runtime-document-settings";
import { Thickness } from "../../cocos/new-ui/base/thickness";
import { UIDocument } from "../../cocos/new-ui/base/ui-document";
import { UIElement } from "../../cocos/new-ui/base/ui-element";
import { ContentControl } from "../../cocos/new-ui/framework/content-control";
import { ContentLayout, HorizontalAlignment, VerticalAlignment } from "../../cocos/new-ui/framework/content-control";

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

test('content-layout-measure', () => {
    const parent = new ContentControl();
    const content = new FixedContentElement();
    parent.content = content;
    content.width = content.height = 100;
    content.measure();
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(100, 100));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));
    (content.layout as ContentLayout).margin = new Thickness(20, 10, 10, 10);
    content.measure();
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(130, 120));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));

    content.width = content.height = 10;
    content.measure();
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(40, 30));
    expect(content.desiredSize).toStrictEqual(new Size(10, 10));

    (content.layout as ContentLayout).margin = new Thickness(0, 0, 0, 0);
    content.measure();
    parent.measure();
    expect(parent.desiredSize).toStrictEqual(new Size(10, 10));
    expect(parent.content.desiredSize).toStrictEqual(new Size(10, 10));
    content.width = 150;
    content.height = 120;
    (content.layout as ContentLayout).margin = new Thickness(15, -10, -7, 9);
    content.measure();
    parent.measure();
    expect(content.desiredSize).toStrictEqual(new Size(150, 120));
    expect(parent.desiredSize).toStrictEqual(new Size(158, 119));

    const content2 = new FixedContentElement();
    content2.width = content2.height = 20;
    parent.content = content2;
    content2.measure();
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
    content2.measure();
    parent2.measure();
    expect(parent2.desiredSize).toStrictEqual(new Size(50, 50));
    expect(content2.desiredSize).toStrictEqual(new Size(50, 50));

    parent.content = parent2.content;
    content2.measure();
    parent.measure();
    parent2.measure();
    expect(parent.content).toBe(content2);
    expect(parent2.content).toBe(null);
    expect(parent2.desiredSize).toStrictEqual(new Size(0, 0));
    expect(parent.desiredSize).toStrictEqual(new Size(50, 50));
    expect(content2.desiredSize).toStrictEqual(new Size(50, 50));
});

test('content-layout-arrange', () => {
    const parent = new ContentControl();
    const content = new FixedContentElement();
    content.width = content.height = 100;
    parent.content = content;
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.STRETCH;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.STRETCH;
    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(50, 50)));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));
    expect(parent.desiredSize).toStrictEqual(new Size(100, 100));
    expect(content.layoutRect.size).toStrictEqual(new Size(50, 50));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(0, 0));
    expect(parent.layoutRect.center).toStrictEqual(new Vec2(0, 0));
    expect(parent.layoutRect.size).toStrictEqual(new Size(50, 50));
    (content.layout as ContentLayout).margin = new Thickness(15, 15, 5, 5);
    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(10, 20), new Size(50, 50)));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));
    expect(parent.desiredSize).toStrictEqual(new Size(120, 120));
    expect(content.layoutRect.size).toStrictEqual(new Size(30, 30));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layoutRect.center).toStrictEqual(new Vec2(10, 20));
    expect(parent.layoutRect.size).toStrictEqual(new Size(50, 50));
    content.width = 20;
    content.height = 20;
    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(50, 50)));
    expect(content.desiredSize).toStrictEqual(new Size(20, 20));
    expect(parent.desiredSize).toStrictEqual(new Size(40, 40));
    expect(content.layoutRect.size).toStrictEqual(new Size(30, 30));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layoutRect.center).toStrictEqual(new Vec2(0, 0));
    expect(parent.layoutRect.size).toStrictEqual(new Size(50, 50));

    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(10, 5), new Size(200, 100)));
    expect(content.desiredSize).toStrictEqual(new Size(20, 20));
    expect(parent.desiredSize).toStrictEqual(new Size(40, 40));
    expect(content.layoutRect.size).toStrictEqual(new Size(180, 80));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layoutRect.center).toStrictEqual(new Vec2(10, 5));
    expect(parent.layoutRect.size).toStrictEqual(new Size(200, 100));

    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.CENTER;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.CENTER;

    content.width = 120;
    content.height = 120;
    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(-20, -5), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(120, 120));
    expect(parent.desiredSize).toStrictEqual(new Size(140, 140));
    expect(content.layoutRect.size).toStrictEqual(new Size(120, 120));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(5, -5));
    expect(parent.layoutRect.center).toStrictEqual(new Vec2(-20, -5));
    expect(parent.layoutRect.size).toStrictEqual(new Size(80, 80));

    //       _______________
    //      ||    |         |
    //      ||____|         |
    //      |               |
    //      |_______________|

    content.width = 20;
    content.height = 20;
    (content.layout as ContentLayout).margin = new Thickness(10, 5, 5, 3);
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.LEFT;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.TOP;
    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(20, 20));
    expect(parent.desiredSize).toStrictEqual(new Size(35, 28));
    expect(content.layoutRect.size).toStrictEqual(new Size(20, 20));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(-20, 25));

    //       _______________
    //      |   |       |   |
    //      |   |       |   |
    //      |   |_______|   |
    //      |_______________|


    content.width = 50;
    content.height = 50;
    (content.layout as ContentLayout).margin = new Thickness(-8, 10, 7, 3);
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.CENTER;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.TOP;

    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(50, 50));
    expect(parent.desiredSize).toStrictEqual(new Size(49, 63));
    expect(content.layoutRect.size).toStrictEqual(new Size(50, 50));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(-7.5, 5));

    //    __________________
    //   |  |               |
    //   |  |               |
    //   |  |               |
    //   |  |_______________|
    //   |__________________|
    //   

    content.width = 100;
    content.height = 100;
    (content.layout as ContentLayout).margin = new Thickness(4, 2, 2, 5);
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.RIGHT;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.TOP;

    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(100, 100));
    expect(parent.desiredSize).toStrictEqual(new Size(106, 107));
    expect(content.layoutRect.size).toStrictEqual(new Size(100, 100));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(-12, -12));

    //    __________________
    //   ||                ||
    //   ||________________||
    //   |                  |
    //   |                  |
    //   |__________________|
    //   

    content.width = 100;
    content.height = 30;
    (content.layout as ContentLayout).margin = new Thickness(4, 2, 2, 5);
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.STRETCH;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.TOP;

    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(100, 30));
    expect(parent.desiredSize).toStrictEqual(new Size(106, 37));
    expect(content.layoutRect.size).toStrictEqual(new Size(74, 30));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(1, 23));

    //       _______________
    //      | ____          |
    //      ||    |         |
    //      ||____|         |
    //      |_______________|

    content.width = 40;
    content.height = 40;
    (content.layout as ContentLayout).margin = new Thickness(10, 5, 5, 3);
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.LEFT;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.CENTER;

    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(40, 40));
    expect(parent.desiredSize).toStrictEqual(new Size(55, 48));
    expect(content.layoutRect.size).toStrictEqual(new Size(40, 40));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(-10, -1));

    //             ____
    //       _____|____|____
    //      |     |    |    |
    //      |     |    |    |
    //      |     |    |    |
    //      |_____|____|____|
    //            |____|

    content.width = 40;
    content.height = 100;
    (content.layout as ContentLayout).margin = new Thickness(10, 0, 5, -10);
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.CENTER;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.CENTER;

    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(40, 100));
    expect(parent.desiredSize).toStrictEqual(new Size(55, 90));
    expect(content.layoutRect.size).toStrictEqual(new Size(40, 100));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(2.5, -5));


    //             
    //       _______________
    //      |          _____|_
    //      |         |     | |
    //      |         |_____|_|
    //      |_______________|
    //          

    content.width = 60;
    content.height = 40;
    (content.layout as ContentLayout).margin = new Thickness(5, 2, -10, 5);
    content.getBehavior(ContentLayout)!.horizontalAlignment = HorizontalAlignment.RIGHT;
    content.getBehavior(ContentLayout)!.verticalAlignment = VerticalAlignment.CENTER;
    content.measure();
    parent.measure();
    parent.arrange(Rect.fromCenterSize(new Rect, new Vec2(0, 0), new Size(80, 80)));
    expect(content.desiredSize).toStrictEqual(new Size(60, 40));
    expect(parent.desiredSize).toStrictEqual(new Size(55, 47));
    expect(content.layoutRect.size).toStrictEqual(new Size(60, 40));
    expect(content.layoutRect.center).toStrictEqual(new Vec2(20, 1.5));

});


test('auto layoutRect', () => {
    const document = new UIDocument();
    (document.settings as UIRuntimeDocumentSettings).renderMode = RenderMode.WORLD_SPACE;
    (document.settings as UIRuntimeDocumentSettings).width = 960;
    (document.settings as UIRuntimeDocumentSettings).height = 640;
    const content = new ContentControl();
    const fixedSizeContent = new FixedContentElement();
    content.addChild(fixedSizeContent);
    (fixedSizeContent.layout as ContentLayout).horizontalAlignment = HorizontalAlignment.LEFT;
    (fixedSizeContent.layout as ContentLayout).verticalAlignment = VerticalAlignment.TOP;
    fixedSizeContent.width = fixedSizeContent.height = 100;
    document.window.addChild(content);
    (content.layout as ContentLayout).horizontalAlignment = HorizontalAlignment.STRETCH;
    (content.layout as ContentLayout).verticalAlignment = VerticalAlignment.STRETCH;
    (content.layout as ContentLayout).margin = new Thickness(10, 10, 10, 10);
    document.update();

    expect(content.desiredSize).toStrictEqual(new Size(100, 100));
    expect(fixedSizeContent.desiredSize).toStrictEqual(new Size(100, 100));
    expect(document.window.desiredSize).toStrictEqual(new Size(120, 120));
    expect(content.layoutRect.size).toStrictEqual(new Size(940, 620));
    expect(content.layoutRect.origin).toStrictEqual(new Vec2(-470, -310));
    expect(fixedSizeContent.layoutRect.size).toStrictEqual(new Size(100, 100));
    expect(fixedSizeContent.layoutRect.center).toStrictEqual(new Vec2(-420, 260));
});