import { Mask } from "../../cocos/2d/components/mask";

describe('render2d-mask', () => {
    test('mask isHit', () => {
        let mask = new Mask();
        mask.name = 'myMask';
        expect(mask.name).toEqual('myMask');
    });

    
});