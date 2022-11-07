// drawContext 为一个 canvas 所持有的上下文，那么其负责提供了 draw方法和 PainterParameters 结构

import { getAttributeStride, vfmtPosColor4B } from "../../2d/renderer/vertex-format";
import { Attribute, Buffer, BufferInfo, BufferUsageBit, Device, deviceManager, MemoryUsageBit, PrimitiveMode, Sampler, Texture } from "../../core/gfx";
import { VisualProxy, VisualRenderProxy } from '../rendering/visual-proxy';
import { Model } from '../../core/renderer/scene';
import { legacyCC } from '../../core/global-exports';
import { scene } from '../../core/renderer';
import { Color, Material, Rect, RenderingSubMesh } from '../../core';
import { IDrawingContext } from "../base/ui-drawing-context";
import { UIDocument } from "../base/ui-document";
import { Visual } from "../base/visual";
import { Brush } from "./brush";

// 在上层进行了paint命令之后，进行方法的提供和 visualProxy 的数据填充
export class RuntimeDrawingContext extends IDrawingContext {
    public static IB_SCALE = 4; // ib size scale based on vertex count

    private _rootProxy: VisualProxy; // 用这个来渲染？// 应该不用双层？
    private _bufferPool : BufferPool; // todo
    private _contextModel :Model;
    private _subModelIndex = 0;

    private _currentVisual: Visual;
    // batch used
    private _currVerticesData;
    private _currIndicesData;
    private _currVBCount = 0;
    private _currIBCount = 0;
    private _emptyMaterial = new Material();
    private _currMaterial: Material = this._emptyMaterial;
    private _currTexture: Texture | null = null;
    private _currSampler: Sampler | null = null;
    private _currHash = 0;

    protected _floatsPerVertex: number;

    get currentVisual () {
        return this._currentVisual;
    }

    set currentVisual (val: Visual) {
        this._currentVisual = val;
    }

    constructor (document: UIDocument) {
        super();
        this._rootProxy = document.window.visualProxy;
        this._currentVisual = document.window;
        this._createModel(); // only model,not have subModel
        this._bufferPool = new BufferPool(vfmtPosColor4B);
        this._floatsPerVertex = getAttributeStride(vfmtPosColor4B) >> 2;
        this._currVerticesData = new Float32Array(65535 * this._floatsPerVertex); // Max length
        this._currIndicesData = new Uint16Array(65535 * RuntimeDrawingContext.IB_SCALE);
        
    }

    public drawRect(rect: Rect, color: Color) {
        let visualProxy = this._currentVisual.visualProxy;
        // init renderData
        visualProxy.initVisualRender(4, 6, color, rect);
    }

    public drawBrush(rect: Rect, color: Color, brush: Readonly<Brush>) {

    }

    public drawText(rect: Rect, color: Color, text: string, font: string, fontSize: number) {

    }

    public paint () {
        
    }

    private buildRenderDataRecursively (proxy: VisualProxy) {
        let visualProxy = proxy._visualRenderArr;
        let len = visualProxy.length;
        for (let j = 0; j < len; j++) {
            let render = visualProxy[j];
            // todo 合批判断 可以利用 dataHash 之类的
            // todo 需要处理 texture 和 simpler
            // todo 需要更新 dataHash
            if (this._currHash !== render.dataHash || this._currMaterial !== render.getMaterial() || this._measureVB(render)) { // 打断合批 // 除了合批条件外还有测量
                this._fillModel(render);
            }
            this._mergeBatch(render);
        }
        for (let i = 0; i < proxy.children.length; i++) {
            this.buildRenderDataRecursively(proxy.children[i]);
        }
    }

    public getContextModel () {
        return this._contextModel; 
    }

    public mergeBatches () {
        this._subModelIndex = 0; // or reset function
        this._contextModel.enabled = false;
        this.buildRenderDataRecursively(this._rootProxy);
        this._fillModel();
    }

    private _fillModel (render?: VisualRenderProxy) {
        this._createSubMesh();
        this._resetState();
        if (render) {
            this._currMaterial = render.getMaterial()!;
            this._currHash = render.dataHash;
        } else {
            this._currMaterial = this._emptyMaterial;
            this._currHash = 0;
        }
    }

    private _mergeBatch (render: VisualRenderProxy) {
        // 通过了合批检查，直接合顶点到一个 buffer 中去
        if (render.getVBCount() === 0) return;
        let vb = render.getVB();
        let vbSize = vb.length;
        this._currVerticesData.set(vb, this._currVBCount);
        

        let ib = render.getIB();
        let ibSize = ib.length;
        const ibTemp = new Uint16Array(ibSize);
        for (let i = 0; i < ibSize; i++) {
            ibTemp[i] = ib[i] +  this._currVBCount / 4; // hack 顶点数量
        }
        this._currIndicesData.set(ibTemp, this._currIBCount);// ib 需要偏移，有问题
        this._currIBCount += ibSize;
        this._currVBCount += vbSize;
    }

    private _resetState () {
        this._currVBCount = this._currIBCount = 0;
        this._currVerticesData.fill(0);
        this._currIndicesData.fill(0);
    }

    private _measureVB (render: VisualRenderProxy) {
        return ((render.getVB.length + this._currVBCount) > 65535);
    }

    private _createModel () {
        if (!this._contextModel) {
            this._contextModel = legacyCC.director.root.createModel(scene.Model);
        }
    }

    private _createSubMesh () {

        // 需要跳出//类似于以前的 ia 不可用的状态
        if (this._currMaterial == this._emptyMaterial) return;

        const bufferInfo = this._bufferPool.requireBuffer();
        const vertexBuffers = bufferInfo.vertexBuffers;
        const indexBuffer = bufferInfo.indexBuffer;
        const attr = bufferInfo.attributes;

        // 甚至可以直接用 vertex 数组即可
        const verticesData = new Float32Array(this._currVerticesData.buffer, 0, this._currVBCount);
        const indicesData = new Uint16Array(this._currIndicesData.buffer, 0, this._currIBCount);
        
        vertexBuffers[0].update(verticesData); // 原生上要给个范围，不然会崩？
        indexBuffer.update(indicesData);

        // mesh 重建
        const submesh = new RenderingSubMesh(vertexBuffers, attr, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
        submesh.subMeshIdx = this._subModelIndex;

        this._contextModel.initSubModel(this._subModelIndex, submesh, this._currMaterial);// heavy & slow todo
        this._contextModel.enabled = true;
        this._subModelIndex++;
    }
}

interface IMeshBufferRef {
    attributes: Attribute[];
    vertexBuffers: Buffer[];
    indexBuffer: Buffer;
}

// 需要一个管理他的类或者接口
// 提供一个类似 getBufferByAttribute 的 api 来返回值
class BufferPool {
    private _device: Device;
    private _attributes: Attribute[]; // 不同的 attribute 不同的 buffer pool
    private _stride = 0;

    private _bufferPool: IMeshBufferRef[] = [];
    private _nextFreeHandle = 0;
    

    constructor (att: Attribute[]) {
        this._device = deviceManager.gfxDevice;
        this._attributes = att;
        this._stride = getAttributeStride(att);
    }

    public reset () {
         this._nextFreeHandle = 0;
    }

    // todo
    public destroy () {
        // 销毁和回收机制，节省内存
    }

    public requireBuffer () {
        if (this._bufferPool.length <= this._nextFreeHandle) {
            this._bufferPool.push(this._createNewBuffer());
        }
        return this._bufferPool[this._nextFreeHandle++];
    }

    private _createNewBuffer (): IMeshBufferRef {
        const attributes = this._attributes;
        const stride = this._stride;
        const gfxDevice: Device = this._device;
        const vertexBuffer = gfxDevice.createBuffer(new BufferInfo(
            BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST,
            MemoryUsageBit.DEVICE,
            8 * stride, // 不能自动扩大？？？
            stride,
        ));
        const vertexBuffers = [vertexBuffer];

        const indexBuffer = gfxDevice.createBuffer(new BufferInfo(
            BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST,
            MemoryUsageBit.DEVICE,
            12 * Uint16Array.BYTES_PER_ELEMENT, // 不能自动扩大？？？
            Uint16Array.BYTES_PER_ELEMENT,
        ));

        return {
            attributes,
            vertexBuffers,
            indexBuffer,
        };
    }
 }