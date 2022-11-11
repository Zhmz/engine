// drawContext 为一个 canvas 所持有的上下文，那么其负责提供了 draw方法和 PainterParameters 结构

import { getAttributeStride, vfmtPosColor4B } from '../../2d/renderer/vertex-format';
import { builtinResMgr, Color, Material, Pool, Rect } from '../../core';
import { IDrawingContext } from '../base/ui-drawing-context';
import { Brush } from './brush';
import { UIDrawCommand } from './ui-draw-command';
import { UIElement } from '../base';
import { VisualProxy } from './visual-proxy';

enum MaterialType {
    ADD_COLOR,
    ADD_COLOR_AND_TEXTURE,
}

export interface ILocalVertexData {
    x: number;
    y: number;
    z: number;
    u: number;
    v: number;
    color: number;
}

const _localVertexDataPool = new Pool(() => ({
    x: 0,
    y: 0,
    z: 0,
    u: 0,
    v: 0,
    color: Color.WHITE._val,
}), 128);

// 在上层进行了paint命令之后，进行方法的提供和 visualProxy 的数据填充
export class RuntimeDrawingContext extends IDrawingContext {
    private _currentElement!: UIElement;
    private _vertexFormat = vfmtPosColor4B;

    protected _floatsPerVertex: number;

    get currentElement () {
        return this._currentElement;
    }

    constructor () {
        super();
        this._floatsPerVertex = getAttributeStride(vfmtPosColor4B) >> 2;
    }

    public getDefaultMaterialByType (type: MaterialType) {
        let mat: Material;
        switch (type) {
        case MaterialType.ADD_COLOR:
            mat = builtinResMgr.get(`ui-base-material`);
            break;
        default:
            mat = builtinResMgr.get(`ui-sprite-material`);
            break;
        }
        return mat;
    }

    public drawRect (rect: Rect, color: Color) {
        // fill local mesh
        const localVbs: ILocalVertexData[] = [];
        const ib = new Uint16Array(6);

        const left = -rect.width * 0.5;
        const right = rect.width * 0.5;
        const bottom = -rect.height * 0.5;
        const top = rect.height * 0.5;

        // left bottom corner
        const localVb0 = _localVertexDataPool.alloc();
        localVb0.x = left;
        localVb0.y = bottom;
        localVb0.z = 0;
        localVb0.color = color._val;
        localVbs.push(localVb0);

        // right bottom corner
        const localVb1 = _localVertexDataPool.alloc();
        localVb1.x = right;
        localVb1.y = bottom;
        localVb1.z = 0;
        localVb1.color = color._val;
        localVbs.push(localVb1);

        // left top corner
        const localVb2 = _localVertexDataPool.alloc();
        localVb2.x = left;
        localVb2.y = top;
        localVb2.z = 0;
        localVb2.color = color._val;
        localVbs.push(localVb2);

        // right top corner
        const localVb3 = _localVertexDataPool.alloc();
        localVb3.x = right;
        localVb3.y = top;
        localVb3.z = 0;
        localVb3.color = color._val;
        localVbs.push(localVb3);

        // need free localVertexData after used

        ib[0] = 0;
        ib[1] = 1;
        ib[2] = 2;
        ib[3] = 1;
        ib[4] = 3;
        ib[5] = 2;

        const command = new UIDrawCommand(this._vertexFormat, 4, 6, localVbs, ib, this.getDefaultMaterialByType(MaterialType.ADD_COLOR));
        (this._currentElement.renderData as VisualProxy).addDrawCommands(command);
    }

    public drawBrush (rect: Rect, color: Color, brush: Readonly<Brush>) {

    }

    public drawText (rect: Rect, color: Color, text: string, font: string, fontSize: number) {

    }

    public paint (element: UIElement) {
        this._currentElement = element;
        this._currentElement.paint(this);
    }
}
