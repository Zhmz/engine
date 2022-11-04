// drawContext 为一个 canvas 所持有的上下文，那么其负责提供了 draw方法和 PainterParameters 结构

import { getAttributeStride, vfmtPosColor4B } from "../../2d/renderer/vertex-format";
import { Attribute, Buffer, BufferInfo, BufferUsageBit, Device, deviceManager, MemoryUsageBit, PrimitiveMode, Sampler, Texture } from "../../core/gfx";
import { VisualProxy, VisualRenderProxy } from '../rendering/visual-proxy';
import { UIElement } from '../base/ui-element';
import { Model } from '../../core/renderer/scene';
import { legacyCC } from '../../core/global-exports';
import { scene } from '../../core/renderer';
import { Material, RenderingSubMesh } from '../../core';
import { IBrushPainterParameters, IDrawingContext, IRectPainterParameters, ITextPainterParameters } from "../base/ui-drawing-context";
import { UIDocument } from "../base/ui-document";

// 在上层进行了paint命令之后，进行方法的提供和 visualProxy 的数据填充
export class RuntimeDrawingContext extends IDrawingContext {
    public static IB_SCALE = 4; // ib size scale based on vertex count

    private _visualProxyQueue: VisualProxy[] = []; // 用这个来渲染？// 应该不用双层？
    private _bufferPool : BufferPool; // todo
    private _contextModel :Model;
    private _subModelIndex = 0;

    private _currentElement: UIElement;
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

    get currentElement () {
        return this._currentElement;
    }

    constructor (document: UIDocument) {
        super();
        this._currentElement = document.window;
        this._createModel(); // only model,not have subModel
        this._bufferPool = new BufferPool(vfmtPosColor4B);
        this._floatsPerVertex = getAttributeStride(vfmtPosColor4B) >> 2;
        this._currVerticesData = new Float32Array(65535 * this._floatsPerVertex); // Max length
        this._currIndicesData = new Uint16Array(65535 * RuntimeDrawingContext.IB_SCALE);
        
    }

    public drawRect(painterParams: IRectPainterParameters) {
        let visualProxy = this.currentElement.visualProxy;
        // init renderData
        visualProxy.initVisualRender(4, 6, painterParams.color, painterParams.rect);
        if (!this._visualProxyQueue.includes(visualProxy)) {
            this._visualProxyQueue.push(visualProxy); // 双层结构？可能不太好 意义不大
        }
    }

    public drawBrush(painterParams: IBrushPainterParameters) {

    }
    public drawText(painterParams: ITextPainterParameters) {

    }

    // 绘制提交全部
    // update 调用
    public paint () {
        this._subModelIndex = 0; // or reset function
        this._contextModel.enabled = false;
        let len = this._visualProxyQueue.length;
        for (let i = 0; i < len; i++) {
            let visualProxy = this._visualProxyQueue[i]._visualRenderArr;
            let len = visualProxy.length;
            for (let j = 0; j < len; j++) {
                let render = visualProxy[j];
                // todo 合批判断 可以利用 dataHash 之类的
                // todo 需要处理 texture 和 simpler
                // todo 需要更新 dataHash
                if (this._currHash !== render.dataHash || this._currMaterial !== render.getMaterial() || this._measureVB(render)) { // 打断合批 // 除了合批条件外还有测量
                    this._createSubMesh();
                    this._subModelIndex++;
                    this._resetState();
                    this._currMaterial = render.getMaterial()!;
                    this._currHash = render.dataHash;
                }
                this._mergeBatch(render);
            }
        }
    }

    public getContextModel () {
        return this._contextModel; 
    }

    private _mergeBatch (render: VisualRenderProxy) {
        // 通过了合批检查，直接合顶点到一个 buffer 中去
        if (render.getVB().length === 0) return;
        let vb = render.getVB();
        let vbSize = vb.length;
        this._currVerticesData.set(vb, this._currVBCount);
        this._currVBCount += vbSize;

        let ib = render.getIB();
        let ibSize = ib.length;
        this._currIndicesData.set(ib, this._currIBCount);
        this._currIBCount += ibSize;
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

        const bufferInfo = this._bufferPool.requireBuffer();
        const vertexBuffers = bufferInfo.vertexBuffers;
        const indexBuffer = bufferInfo.indexBuffer;
        const attr = bufferInfo.attributes;

        // 甚至可以直接用 vertex 数组即可
        const verticesData = new Float32Array(this._currVerticesData.buffer, 0, this._currVBCount >> 2);
        const indicesData = new Uint16Array(this._currIndicesData.buffer, 0, this._currIBCount);
        
        vertexBuffers[0].update(verticesData); // 原生上要给个范围，不然会崩？
        indexBuffer.update(indicesData);

        // mesh 重建
        const submesh = new RenderingSubMesh(vertexBuffers, attr, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
        submesh.subMeshIdx = this._subModelIndex;

        this._contextModel.initSubModel(this._subModelIndex, submesh, this._currMaterial);// heavy & slow todo
        this._contextModel.enabled = true;
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
            4 * stride,
            stride,
        ));
        const vertexBuffers = [vertexBuffer];

        const indexBuffer = gfxDevice.createBuffer(new BufferInfo(
            BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST,
            MemoryUsageBit.DEVICE,
            6 * Uint16Array.BYTES_PER_ELEMENT,
            Uint16Array.BYTES_PER_ELEMENT,
        ));

        return {
            attributes,
            vertexBuffers,
            indexBuffer,
        };
    }
 }