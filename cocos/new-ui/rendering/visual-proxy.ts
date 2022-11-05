
/*
 Copyright (c) 2017-2022 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { getAttributeStride, vfmtPosColor4B, vfmtPosUvColor } from "../../2d/renderer/vertex-format";
import { Material, Texture2D } from "../../core/assets";
import { builtinResMgr } from "../../core/builtin/builtin-res-mgr";
import { Texture, Sampler } from "../../core/gfx";
import { Color, Rect } from "../../core/math";

export class VisualProxy {
    // 由于想在上一层进行绘制，此处公开
    public _visualRenderArr: VisualRenderProxy[] = []; // 可以是索引

    // rect init // 实际上决定了不同的 fill 类型和操作
    // 希望在这一层就能把差异抹平，在 RenderProxy 中是纯数据类，无分支的那种
    public initVisualRender(vertexCount: number, indexCount: number, color: Color, rect: Rect) {
        let vis = new VisualRenderProxy();
        vis.setVBCount(vertexCount);
        vis.setIBCount(indexCount);
        vis.initRectMesh(color, rect);
        let material = VisualRenderProxy.getMaterialByType(MaterialType.ADD_COLOR);
        vis.setMaterial(material);
        this._visualRenderArr.push(vis);
        // 除了矩阵没乘，就都ok了
    }
    
    // public updateVisualRender (index, ...) {

    // }

}

enum MaterialType {
    ADD_COLOR = 0,
    ADD_COLOR_AND_TEXTURE = 1,
}

export class VisualRenderProxy {

    public static getMaterialByType(type: MaterialType) {
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

    // texture
    protected _material: Material | null = null; // 不可为空
    protected _texture: Texture | null = null;
    protected _sampler: Sampler | null = null;

    // Mesh
    protected _vbCount = 0;
    protected _ibCount = 0;
    protected _vertexOffset = 0;
    protected _indexOffset = 0;
    // 这个结构理应可以精简
    protected _vb: Float32Array | null = null; // local vertex //不可为空
    protected _ib: Uint16Array | null = null;

    // batcher use
    // protected _vData: Float32Array | null = null; // meshBUffer 的大数组 
    // protected _iData: Uint16Array | null = null; // 也可以之后再分配主要是用于合批的
    protected _dataHash = 0; // 合批用
    protected _stride = 0; 
    protected _floatStride = 0;
    protected _vertexFormat = vfmtPosColor4B;

    constructor (vertexFormat = vfmtPosColor4B) {
        this._stride = getAttributeStride(vertexFormat);
        this._floatStride = this._stride >> 2;
        this._vertexFormat = vertexFormat;
    }

    get dataHash () {
        return this._dataHash; // 变化时进行更新
    }

    get stride () {
        return this._stride; // 固定值
    }

    get attribute () {
        return this._vertexFormat;
    }

    public setVertexOffset (vertexOffset) {
        this._vertexOffset = vertexOffset;
    }

    public setIndexOffset (indexOffset) {
        this._indexOffset = indexOffset;
    }

    public setVB (vbBuffer: Float32Array) {
        this._vb = vbBuffer;
    }
    public getVB () {
        return this._vb!; // 单个对象的顶点值，合批前使用这个
    }

    public setIB (ibBuffer: Uint16Array) {
        this._ib = ibBuffer;
    }
    public getIB () {
        return this._ib!;
    }

    // public setVData (vDataBuffer: Float32Array) {
    //     this._vData = vDataBuffer;
    // }
    // public getVData () {
    //     return this._vData; // 大buffer中的view，在合批之前不应该是他
    // }

    // public setIData (iDataBuffer: Uint16Array) {
    //     this._iData= iDataBuffer;
    // }
    // public getIData () {
    //     return this._iData; // 大buffer中的view，在合批之前不应该是他
    // }

    public setVBCount (vbCount) {
        this._vbCount = vbCount;
    }
    public getVBCount() {
        return this._vbCount;
    }

    public setIBCount (ibCount) {
        this._ibCount = ibCount;
    }
    public getIBCount () {
        return this._ibCount;
    }

    public setDataHash (dataHash: number) {
        this._dataHash = dataHash;
    }

    public setMaterial (material: Material) {
        this._material = material;
    }
    public getMaterial () {
        return this._material;
    }

    public setTexture (texture: Texture | null) {
        this._texture = texture;
    }

    public setSampler (sampler: Sampler | null) {
        this._sampler = sampler;
    }

    public initRectMesh (color:Color, rect: Rect) {
        // only need fill local mesh
        this._vb = new Float32Array(this._vbCount * this._floatStride); // 5?
        this._ib = new Uint16Array(this._ibCount);

        let stride = this._floatStride;
        let l = - rect.width * 0.5; // anchor 是否在此处处理
        let r = rect.width * 0.5;
        let b = - rect.height * 0.5; // anchor 是否在此处处理
        let t = rect.height * 0.5;
        this._vb[this._vertexOffset + 0 + stride * 0] = l;
        this._vb[this._vertexOffset + 1 + stride * 0] = b;
        this._vb[this._vertexOffset + 2 + stride * 0] = 0;
        this._vb[this._vertexOffset + 3 + stride * 0] = color._val;

        this._vb[this._vertexOffset + 0 + stride * 1] = r;
        this._vb[this._vertexOffset + 1 + stride * 1] = b;
        this._vb[this._vertexOffset + 2 + stride * 3] = 0;
        this._vb[this._vertexOffset + 3 + stride * 1] = color._val;

        this._vb[this._vertexOffset + 0 + stride * 2] = l;
        this._vb[this._vertexOffset + 1 + stride * 2] = t;
        this._vb[this._vertexOffset + 2 + stride * 3] = 0;
        this._vb[this._vertexOffset + 3 + stride * 2] = color._val;

        this._vb[this._vertexOffset + 0 + stride * 3] = r;
        this._vb[this._vertexOffset + 1 + stride * 3] = t;
        this._vb[this._vertexOffset + 2 + stride * 3] = 0;
        this._vb[this._vertexOffset + 3 + stride * 3] = color._val;

        this._vertexOffset += this._vbCount;

        this._ib[this._indexOffset + 0] = 0;
        this._ib[this._indexOffset + 1] = 1;
        this._ib[this._indexOffset + 2] = 2;
        this._ib[this._indexOffset + 3] = 1;
        this._ib[this._indexOffset + 4] = 3;
        this._ib[this._indexOffset + 5] = 2;

        this._indexOffset += this._ibCount;

    }
}