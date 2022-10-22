import { AdvancedProperty, Primitive } from "../../cocos/new-ui/base/advanced-property";
import { AdvancedObject } from "../../cocos/new-ui/base/advanced-object";
import { AttachedObject } from "../../cocos/new-ui/base/attached-object";

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

test('attached object', () => {
    const owner = new AdvancedObject();
    class MyAttachedObject extends AttachedObject {
        public static TestProperty = AdvancedProperty.register('Test', Primitive.NUMBER, MyAttachedObject);

        get test () {
            return this.getValue(MyAttachedObject.TestProperty) as number;
        }

        set test (val) {
            this.setValue(MyAttachedObject.TestProperty, val);
        }
    }

    const attachedObject = new MyAttachedObject(owner);
    attachedObject.test = 10;
    expect(attachedObject.test).toBe(10);
    expect(owner.getValue(MyAttachedObject.TestProperty)).toBe(10);
    owner.setValue(MyAttachedObject.TestProperty, 20);
    expect(attachedObject.test).toBe(20);
});

test('default-value', () => {

    enum TestEnum {
        TEST_1,
        TEST_2,
        TEST_3
    }
    class MyTestClass extends AdvancedObject {
        public static TestProperty = AdvancedProperty.register('Test', Primitive.NUMBER, MyTestClass, 10);
        public static TestBoolProperty = AdvancedProperty.register('Test1', Primitive.BOOLEAN, MyTestClass, true);
        public static TestStringProperty = AdvancedProperty.register('Test2', Primitive.STRING, MyTestClass, 'test');
        public static TestEnumProperty = AdvancedProperty.register('Test3', TestEnum, MyTestClass);
    }

    const testObject = new MyTestClass();
    expect(testObject.getValue(MyTestClass.TestProperty)).toBe(10);
    testObject.setValue(MyTestClass.TestProperty, 50);
    expect(testObject.getValue(MyTestClass.TestProperty)).toBe(50);

    expect(testObject.getValue(MyTestClass.TestBoolProperty)).toBe(true);
    testObject.setValue(MyTestClass.TestBoolProperty, false);
    expect(testObject.getValue(MyTestClass.TestBoolProperty)).toBe(false);

    expect(testObject.getValue(MyTestClass.TestStringProperty)).toBe('test');
    testObject.setValue(MyTestClass.TestStringProperty, 'hello world');
    expect(testObject.getValue(MyTestClass.TestStringProperty)).toBe('hello world');

    expect(testObject.getValue(MyTestClass.TestEnumProperty)).toBe(AdvancedProperty.UNSET_VALUE);
    testObject.setValue(MyTestClass.TestEnumProperty, TestEnum.TEST_3);
    expect(testObject.getValue(MyTestClass.TestEnumProperty)).toBe(TestEnum.TEST_3);
});
