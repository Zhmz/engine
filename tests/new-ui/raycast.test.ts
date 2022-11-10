import { Vec3 } from "../../cocos/core";
import { Plane, Ray } from "../../cocos/core/geometry";
import { raycastPlane } from "../../cocos/core/geometry/intersect";

test('hitTest',()=>{

    





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
    ray.o.set(1,0,0);
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