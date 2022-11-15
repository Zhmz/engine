import { Rect, Size, Vec3 } from "../../cocos/core";
import { Plane, Ray } from "../../cocos/core/geometry";
import { raycastPlane } from "../../cocos/core/geometry/intersect";
import { ContainerElement, UIDocument, UIElement } from "../../cocos/new-ui/base";
import { ContentLayout } from "../../cocos/new-ui/framework/content-control";

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

test('hitTest', () => {

    const document = new UIDocument();
    const element = new SingleChildElement();
    const ray = new Ray();
    document.window.addChild(element);

    element.renderTransform.position = new Vec3(0, 0, 1);
    element.layoutRect = new Rect(-0.5,-0.5,1,1);
    ray.o = new Vec3(0,0,-1);
    ray.d = new Vec3(0,0,1);
    let hit = element.hitTest(ray);
    expect(hit).toBeTruthy();

    // the ray can raycast the plane(infinitely expandable), but cannot raycast the element(the element has a fixed size)
    ray.d = new Vec3(0,1,1);
    hit = element.hitTest(ray);
    expect(hit).toBeFalsy();

    // it can raycast the element and the intersect point is inside the element(Exactly located on the edge)
    ray.d = new Vec3(0,0.25,1);
    hit = element.hitTest(ray);
    expect(hit).toBeTruthy();

    // the origin of the ray is opposite to that of plane, so it cannot raycast the plane forever
    ray.o = new Vec3(0,0,2);
    hit = element.hitTest(ray);
    expect(hit).toBeFalsy();

    // Ray and plane are in the same direction, so the ray cannot raycast the plane forever
    ray.o = new Vec3(0,0,-1);
    ray.d = new Vec3(0,0,-1);
    hit = element.hitTest(ray);
    expect(hit).toBeFalsy();

    // element pivot is not located at origin, it is at (0,-0.5,1), the intersect point of plane and ray is at (0,0.5,1)
    // which is not included in the UIElement
    ray.o = new Vec3(0,0,-1);
    ray.d = new Vec3(0,0.25,1);
    element.layoutRect = new Rect(-1,-1,1,1);
    hit = element.hitTest(ray);
    expect(hit).toBeFalsy();

    // the ray can hit the element at (0,0) in local coordinate
    ray.d = new Vec3(-0.25,-0.25,1);
    hit = element.hitTest(ray);
    expect(hit).toBeTruthy();
});

test('raycastPlane', () => {
    // default as a xoz plane
    const plane: Plane = new Plane();
    const pointA = new Vec3();
    const pointB = new Vec3();
    const pointC = new Vec3();
    //default as a ray to -z
    const ray = new Ray();
    const result: Vec3 = new Vec3();

    // 1.ray and plane coincide(fail)
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(0);

    // 2.set plane as yoz,x=1(fail)
    pointA.set(1, 0, 0);
    pointB.set(1, 1, 0);
    pointC.set(1, 0, 1);
    Plane.fromPoints(plane, pointA, pointB, pointC);
    // ray is parallel to plane
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(0);

    // 3.set plane as xoy,z=1(fail)
    pointA.set(0, 0, 1);
    pointB.set(0, 1, 1);
    pointC.set(1, 0, 1);
    Plane.fromPoints(plane, pointA, pointB, pointC);
    // ray starts at (0,0,0), and its direction is to -z, so it cannot raycast the plane
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(0);

    // 4.set plane as xoy,z=-1(success)
    pointA.set(0, 0, -1);
    pointB.set(0, 1, -1);
    pointC.set(1, 0, -1);
    Plane.fromPoints(plane, pointA, pointB, pointC);
    // it can raycast the plane
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(-1);

    // 5.set ray direction as (0,1,-1)(success)
    ray.d.set(0, 1, -1);
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(0);
    expect(result.y).toBe(1);
    expect(result.z).toBe(-1);

    // 6.set ray origin as (1,0,0)(success)
    ray.o.set(1, 0, 0);
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(1);
    expect(result.y).toBe(1);
    expect(result.z).toBe(-1);

    // 7.set ray direction as (1,1,-1)(success)
    ray.d.set(1, 1, -1);
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(2);
    expect(result.y).toBe(1);
    expect(result.z).toBe(-1);

    // 8.set ray direction as (1,1,1)(fail)
    ray.d.set(1, 1, 1);
    raycastPlane(result, ray, plane);
    expect(result.x).toBe(2);
    expect(result.y).toBe(1);
    expect(result.z).toBe(-1);
});