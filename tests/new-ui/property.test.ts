import { AdvancedProperty, Primitive } from "../../cocos/new-ui/base/advanced-property";
import { AdvancedObject } from "../../cocos/new-ui/base/advanced-object";
import { AttachedObject } from "../../cocos/new-ui/base/attached-object";

test('advanced-property', () => {
    class MyTestClass extends AdvancedObject{}
    class MyTestClass2 extends AdvancedObject{}

    expect(AdvancedProperty.allRegisteredProperties.length).toBe(0);
    const testProperty = AdvancedProperty.register('Test', Primitive.NUMBER, MyTestClass);
    expect(testProperty.name).toBe('Test');
    expect(testProperty.propertyType).toBe(Primitive.NUMBER);
    expect(testProperty.ownerType).toBe(MyTestClass);
    expect(testProperty.defaultValue).toBe(AdvancedProperty.UNSET_VALUE);
    expect(AdvancedProperty.allRegisteredProperties.length).toBe(1);
    let registeredProperties = AdvancedProperty.getRegisteredPropertiesForOwnerType(MyTestClass);
    expect(registeredProperties.length).toBe(1);
    expect(registeredProperties[0]).toBe(testProperty);

    const defaultVal = new MyTestClass();
    const testProperty2 = AdvancedProperty.register('Test2', MyTestClass, MyTestClass, defaultVal);
    expect(testProperty2.name).toBe('Test2');
    expect(testProperty2.propertyType).toBe(MyTestClass);
    expect(testProperty2.ownerType).toBe(MyTestClass);
    expect(testProperty2.defaultValue).toBeTruthy();
    expect(testProperty2.defaultValue).toBe(defaultVal);
    expect(AdvancedProperty.allRegisteredProperties.length).toBe(2);
    registeredProperties = AdvancedProperty.getRegisteredPropertiesForOwnerType(MyTestClass);
    expect(registeredProperties.length).toBe(2);
    expect(registeredProperties[0]).toBe(testProperty);
    expect(registeredProperties[1]).toBe(testProperty2);
    expect(testProperty2.id).not.toBe(testProperty.id);

    const testProperty3 = AdvancedProperty.register('Test3', Primitive.BOOLEAN, MyTestClass2, true);
    expect(testProperty3.name).toBe('Test3');
    expect(testProperty3.propertyType).toBe(Primitive.BOOLEAN);
    expect(testProperty3.ownerType).toBe(MyTestClass2);
    expect(testProperty3.defaultValue).toStrictEqual(true);
    expect(AdvancedProperty.allRegisteredProperties.length).toBe(3);
    registeredProperties = AdvancedProperty.getRegisteredPropertiesForOwnerType(MyTestClass);
    expect(registeredProperties.length).toBe(2);
    expect(registeredProperties[0]).toBe(testProperty);
    expect(registeredProperties[1]).toBe(testProperty2);
    registeredProperties = AdvancedProperty.getRegisteredPropertiesForOwnerType(MyTestClass2);
    expect(registeredProperties.length).toBe(1);
    expect(registeredProperties[0]).toBe(testProperty3);
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

test('clear-value', () => {
    class MyTestClass extends AdvancedObject {
        public static TestProperty = AdvancedProperty.register('Test', Primitive.NUMBER, MyTestClass, 10);
        public static TestBoolProperty = AdvancedProperty.register('Test1', Primitive.BOOLEAN, MyTestClass, true);
        public static TestStringProperty = AdvancedProperty.register('Test2', Primitive.STRING, MyTestClass, 'test');
        public static TestObjectProperty = AdvancedProperty.register('Test3', Object, MyTestClass);
    }

    const testObject = new MyTestClass();
    testObject.setValue(MyTestClass.TestProperty, 20);
    expect(testObject.getValue(MyTestClass.TestProperty)).toBe(20);
    testObject.clearValue(MyTestClass.TestProperty);
    expect(testObject.getValue(MyTestClass.TestProperty)).toBe(10);
    testObject.setValue(MyTestClass.TestProperty, 20);

    testObject.setValue(MyTestClass.TestBoolProperty, false);
    expect(testObject.getValue(MyTestClass.TestBoolProperty)).toStrictEqual(false);
    testObject.clearValue(MyTestClass.TestBoolProperty);
    expect(testObject.getValue(MyTestClass.TestProperty)).toBe(20);
    expect(testObject.getValue(MyTestClass.TestBoolProperty)).toBe(true);
});
