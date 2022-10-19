import { Thickness } from "../../cocos/new-ui/base/thickness"

test('thickness', () => {
    const thickness = new Thickness();
    expect(thickness.top).toBe(0);
    expect(thickness.bottom).toBe(0);
    expect(thickness.left).toBe(0);
    expect(thickness.right).toBe(0);
    thickness.left = 10;
    thickness.right = 20;
    thickness.top = -10;
    thickness.bottom = 50;
    expect(thickness.top).toBe(-10);
    expect(thickness.bottom).toBe(50);
    expect(thickness.left).toBe(10);
    expect(thickness.right).toBe(20);
    const thickness2 = thickness.clone();
    expect(thickness2.top).toBe(-10);
    expect(thickness2.bottom).toBe(50);
    expect(thickness2.left).toBe(10);
    expect(thickness2.right).toBe(20);
    expect(thickness2.equals(thickness)).toBeTruthy();
    thickness.top = -9.999999;
    thickness.bottom = 49.999999;
    thickness.left = 10.0000001;
    expect(thickness2.equals(thickness)).toBeTruthy();
    thickness.left = 5;
    expect(thickness2.equals(thickness)).toBeFalsy();
    thickness.right = 10;
    thickness.top = 11;
    thickness.bottom = 5;

    const thickness3 = new Thickness(10);
    expect(thickness3.top).toBe(10);
    expect(thickness3.left).toBe(10);
    expect(thickness3.right).toBe(10);
    expect(thickness3.bottom).toBe(10);
    thickness3.set(thickness);
    expect(thickness3.equals(thickness)).toBeTruthy();
    expect(thickness.equals(thickness2)).toBeFalsy();


})