import { getAttributeStride } from '../../2d/renderer/vertex-format';
import { Material } from '../../core';
import { Attribute, Sampler, Texture } from '../../core/gfx';

export class UIDrawCommand {
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
    protected _vertexFormat: Attribute[];

    constructor (vertexFormat, vbCount, ibCount, vb, ib, material) {
        this._stride = getAttributeStride(vertexFormat);
        this._floatStride = this._stride >> 2;
        this._vertexFormat = vertexFormat;
        this._vbCount = vbCount;
        this._ibCount = ibCount;
        this._vb = vb;
        this._ib = ib;
        this._material = material;
    }

    get floatStride () {
        return this._floatStride;
    }

    get dataHash () {
        return this._dataHash; // 变化时进行更新
    }

    get stride () {
        return this._stride; // 固定值
    }

    get attribute (): ReadonlyArray<Attribute> {
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
    public getVBCount () {
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
}
