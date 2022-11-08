// drawContext 为一个 canvas 所持有的上下文，那么其负责提供了 draw方法和 PainterParameters 结构

import { getAttributeStride, vfmtPosColor4B } from '../../2d/renderer/vertex-format';
import { builtinResMgr, Color, Material, Rect } from '../../core';
import { IDrawingContext } from '../base/ui-drawing-context';
import { UIDocument } from '../base/ui-document';
import { Visual } from '../base/visual';
import { Brush } from './brush';
import { UIDrawCommand } from './ui-draw-command';
import { UIElement } from '../base';
import { VisualProxy } from './visual-proxy';

enum MaterialType {
    ADD_COLOR,
    ADD_COLOR_AND_TEXTURE,
}

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
        const stride = this._floatsPerVertex;
        // only need fill local mesh
        const vb = new Float32Array(4 * stride);
        const uvb = new Uint32Array(vb.buffer);
        const ib = new Uint16Array(6);

        const left = -rect.width * 0.5;
        const right = rect.width * 0.5;
        const bottom = -rect.height * 0.5;
        const top = rect.height * 0.5;

        // left bottom corner
        let vertexOffset = 0;
        vb[vertexOffset] = left;
        vb[1 + vertexOffset] = bottom;
        vb[2 + vertexOffset] = 0;
        uvb[3 + vertexOffset] = color._val;

        vertexOffset += stride;

        // right bottom corner
        vb[vertexOffset] = right;
        vb[1 + vertexOffset] = bottom;
        vb[2 + vertexOffset] = 0;
        uvb[3 + vertexOffset] = color._val;

        vertexOffset += stride;

        // left top corner
        vb[vertexOffset] = left;
        vb[1 + vertexOffset] = top;
        vb[2 + vertexOffset] = 0;
        uvb[3 + vertexOffset] = color._val;

        vertexOffset += stride;

        // right top corner
        vb[vertexOffset] = right;
        vb[1 + vertexOffset] = top;
        vb[2 + vertexOffset] = 0;
        uvb[3 + vertexOffset] = color._val;

        ib[0] = 0;
        ib[1] = 1;
        ib[2] = 2;
        ib[3] = 1;
        ib[4] = 3;
        ib[5] = 2;

        const command = new UIDrawCommand(this._vertexFormat, 4, 6, vb, ib, this.getDefaultMaterialByType(MaterialType.ADD_COLOR));
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
