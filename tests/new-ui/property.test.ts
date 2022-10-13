import { AdvancedProperty } from "../../cocos/new-ui/property/advanced-property";
import { AdvancedObject } from "../../cocos/new-ui/property/advanced-object";

test('advanced-property', () => {
    class MyTestClass extends AdvancedObject{}
    const testProperty = AdvancedProperty.register('Test', Number, MyTestClass);
    expect(testProperty.name).toBe('Test');
    expect(testProperty.propertyType).toBe(Number);
    expect(testProperty.ownerType).toBe(MyTestClass);
});

test('advanced-object', () => {
    class MyTestClass extends AdvancedObject {
        public static TestProperty = AdvancedProperty.register('Test', Number, MyTestClass);

        get test () {
            return this.getValue(MyTestClass.TestProperty) as number;
        }

        set test (val: number) {
            this.setValue(MyTestClass.TestProperty, val);
        }
    }

    const test = new MyTestClass();
    test.test = 10;
    expect(test.test).toBe(10);
    test.setValue(MyTestClass.TestProperty, 20);
    expect(test.test).toBe(20);
});