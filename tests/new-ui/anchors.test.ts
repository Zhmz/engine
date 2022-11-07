import { Vec2 } from "../../cocos/core/math/vec2";
import { Anchors } from "../../cocos/new-ui/base/anchors"

test('anchors', () => {
    const anchors = new Anchors;
    expect(anchors.min).toStrictEqual(Vec2.ZERO);
    expect(anchors.max).toStrictEqual(Vec2.ZERO);
    const max = new Vec2(1, 1);
    anchors.max = max;
    expect(anchors.max).toStrictEqual(max);
    max.x = 0.5;
    expect(anchors.max).toStrictEqual(new Vec2(1, 1));
    anchors.min = new Vec2(10, 10);
    expect(anchors.min).toStrictEqual(new Vec2(10, 10));

    const anchors2 = new Anchors(1, 2, 3, 4);
    expect(anchors2.min).toStrictEqual(new Vec2(1, 2));
    expect(anchors2.max).toStrictEqual(new Vec2(3, 4));

    expect(anchors.equals(anchors2)).toBeFalsy();
    anchors.set(anchors2);
    expect(anchors).toStrictEqual(anchors2);
    const anchors3 = new Anchors(1, 1);
    expect(anchors3.min).toStrictEqual(new Vec2(1, 1));
    expect(anchors3.max).toStrictEqual(new Vec2(1, 1));
    const anchors4 = anchors3.clone();
    expect(anchors4.min).toStrictEqual(new Vec2(1, 1));
    expect(anchors4.max).toStrictEqual(new Vec2(1, 1));
});