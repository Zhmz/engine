import { AdvancedProperty, Primitive } from "../../cocos/new-ui/property/advanced-property";
import { AdvancedObject } from "../../cocos/new-ui/property/advanced-object";

test('advanced-property', () => {
    class MyTestClass extends AdvancedObject{}
    const testProperty = AdvancedProperty.register('Test', Primitive.NUMBER, MyTestClass);
    expect(testProperty.name).toBe('Test');
    expect(testProperty.propertyType).toBe(Primitive.NUMBER);
    expect(testProperty.ownerType).toBe(MyTestClass);
});

test('advanced-object', () => {
    enum TestEnum {
        TEST_1,
        TEST_2,
        TEST_3
    } 
    class MyTestClass extends AdvancedObject {
        public static TestProperty = AdvancedProperty.register('Test', Primitive.NUMBER, MyTestClass);
        public static TestBoolProperty = AdvancedProperty.register('Test1', Primitive.BOOLEAN, MyTestClass);
        public static TestStringProperty = AdvancedProperty.register('Test2', Primitive.STRING, MyTestClass);
        public static TestEnumProperty = AdvancedProperty.register('Test3', TestEnum, MyTestClass);

        get test () {
            return this.getValue(MyTestClass.TestProperty) as number;
        }

        set test (val: number) {
            this.setValue(MyTestClass.TestProperty, val);
        }

        get testBool () {
            return this.getValue(MyTestClass.TestBoolProperty) as boolean;
        }

        set testBool (val: boolean) {
            this.setValue(MyTestClass.TestBoolProperty, val);
        }

        get testString () {
            return this.getValue(MyTestClass.TestStringProperty) as string;
        }

        set testString (val: string) {
            this.setValue(MyTestClass.TestStringProperty, val);
        }

        get testEnum () {
            return this.getValue(MyTestClass.TestEnumProperty) as TestEnum;
        }

        set testEnum (val: TestEnum) {
            this.setValue(MyTestClass.TestEnumProperty, val);
        }
    }

    const test = new MyTestClass();
    test.test = 10;
    expect(test.test).toBe(10);
    test.setValue(MyTestClass.TestProperty, 20);
    expect(test.test).toBe(20);

    expect(test.testBool).toBe(undefined);
    test.testBool = false;
    expect(test.testBool).toBe(false);
    expect(typeof test.testBool).toBe('boolean');
    test.testBool = true;
    expect(test.testBool).toBe(true);

    expect(test.testString).toBe(undefined);
    test.testString = 'test';
    expect(test.testString).toBe('test');
    test.testString = 'test2';
    expect(test.testString).toBe('test2');

    expect(test.testEnum).toBe(undefined);
    test.testEnum = TestEnum.TEST_1;
    expect(test.testEnum).toBe(TestEnum.TEST_1);
    test.testEnum = TestEnum.TEST_2;
    expect(test.testEnum).toBe(TestEnum.TEST_2);
});