import { getAttributeStride, vfmtPosColor4B } from '../../2d/renderer/vertex-format';
import { Attribute, Buffer, BufferInfo, BufferUsageBit, Device, deviceManager, MemoryUsageBit, PrimitiveMode, Sampler, Texture } from '../../core/gfx';
import { VisualDirty, VisualProxy } from './visual-proxy';
import { Model } from '../../core/renderer/scene';
import { legacyCC } from '../../core/global-exports';
import { scene } from '../../core/renderer';
import { approx, Material, RenderingSubMesh } from '../../core';
import { UIDrawCommand } from './ui-draw-command';
import { ILocalVertexData } from './runtime-drawing-context';

export class UIBatchBuilder {
    public static IB_SCALE = 4; // ib size scale based on vertex count
    private _bufferPool : BufferPool; // todo
    private _contextModel :Model;
    private _subModelIndex = 0;
    // batch used
    private _currVerticesData;
    private _currIndicesData;
    private _currVBCount = 0;
    private _currIBCount = 0;
    private _currVertexOffset = 0;
    private _emptyMaterial = new Material();
    private _currMaterial: Material = this._emptyMaterial;
    private _currTexture: Texture | null = null;
    private _currSampler: Sampler | null = null;
    private _currHash = 0;
    protected _floatsPerVertex: number;

    constructor () {
        this._contextModel = legacyCC.director.root.createModel(scene.Model);
        this._bufferPool = new BufferPool(vfmtPosColor4B);
        this._floatsPerVertex = getAttributeStride(vfmtPosColor4B) >> 2;
        this._currVerticesData = new Float32Array(65535 * this._floatsPerVertex); // Max length
        this._currIndicesData = new Uint16Array(65535 * UIBatchBuilder.IB_SCALE);
    }

    private buildBatchRecursively (proxy: VisualProxy) {
        if (!proxy.isVisible || approx(proxy.opacity, 0)) {
            return;
        }
        const drawCommands = proxy.getDrawCommands();
        const len = drawCommands.length;
        if (drawCommands.length > 0) {
            for (let j = 0; j < len; j++) {
                const render = drawCommands[j];
                if (proxy.dirtyFlags & VisualDirty.TRANSFORM) { // worldTrsDirty
                    this._updateWorldVerts(render, proxy);
                }
                if (proxy.dirtyFlags & VisualDirty.OPACITY) { // opacity dirty
                    this._updateOpacity(render, proxy);
                }
                // todo 合批判断 可以利用 dataHash 之类的
                // todo 需要处理 texture 和 simpler
                // todo 需要更新 dataHash
                if (this._currHash !== render.dataHash || this._currMaterial !== render.getMaterial() || this._measureVB(render)) { // 打断合批 // 除了合批条件外还有测量
                    this._fillModel(render);
                }
                this._mergeBatch(render);
            }
        }
        proxy.resetDirty();
        let cur: VisualProxy | null = proxy.children;
        while (cur) {
            this.buildBatchRecursively(cur);
            cur = cur.nextSibling;
        }
    }

    public getContextModel () {
        return this._contextModel;
    }

    public buildBatches (rootProxy: VisualProxy) {
        this._subModelIndex = 0; // or reset function
        this._contextModel.enabled = false;
        this.buildBatchRecursively(rootProxy);
        this._fillModel();
    }

    private _fillModel (render?: UIDrawCommand) {
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

    private _mergeBatch (render: UIDrawCommand) {
        // 通过了合批检查，直接合顶点到一个 buffer 中去
        const vbOffset = render.getVBCount();
        if (vbOffset === 0) return;

        const vb = render.getVB();
        const vbSize = vb.length;
        this._currVerticesData.set(vb, this._currVBCount);

        const ib = render.getIB();
        const ibSize = ib.length;
        const ibTemp = new Uint16Array(ibSize);
        for (let i = 0; i < ibSize; i++) {
            ibTemp[i] = ib[i] +  this._currVertexOffset;
        }
        this._currIndicesData.set(ibTemp, this._currIBCount);

        this._currIBCount += ibSize;
        this._currVBCount += vbSize;
        this._currVertexOffset += vbOffset;
    }

    private _resetState () {
        this._currVBCount = this._currIBCount = this._currVertexOffset = 0;
        this._currVerticesData.fill(0);
        this._currIndicesData.fill(0);
    }

    private _measureVB (render: UIDrawCommand) {
        return ((render.getVB.length + this._currVBCount) > 65535);
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

        const vertexBuffer = vertexBuffers[0];
        const byteCount = this._currVBCount << 2;
        if (byteCount > vertexBuffer.size) {
            vertexBuffer.resize(byteCount);
        }
        vertexBuffer.update(verticesData);
        if (this._currIBCount * 2 > indexBuffer.size) {
            indexBuffer.resize(this._currIBCount * 2);
        }
        indexBuffer.update(indicesData);

        // mesh 重建
        const submesh = new RenderingSubMesh(vertexBuffers, attr, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
        submesh.subMeshIdx = this._subModelIndex;

        this._contextModel.initSubModel(this._subModelIndex, submesh, this._currMaterial);// heavy & slow todo
        this._contextModel.enabled = true;
        this._subModelIndex++;
    }

    private _updateWorldVerts (render: UIDrawCommand, proxy: VisualProxy) {
        const dataList: ILocalVertexData[] = render.getLocalVB();
        const vData = render.getVB();
        const uintVData = render.getUintVB();
        // hack for Synchronization
        // const m = proxy.worldMatrix;// todo use this
        const m = proxy.worldMatrix;

        // todo
        // 如何判断是否包含 uv
        const stride = render.floatStride;
        let offset = 0;
        const length = dataList.length;
        for (let i = 0; i < length; i++) {
            const curData = dataList[i];
            const x = curData.x;
            const y = curData.y;
            let rhw = m.m03 * x + m.m07 * y + m.m15;
            rhw = rhw ? Math.abs(1 / rhw) : 1;

            offset = i * stride;
            vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
            vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
            vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
            uintVData[offset + 3] = curData.color;
        }
    }

    private _updateOpacity (render: UIDrawCommand, proxy: VisualProxy) {
        const dataList: ILocalVertexData[] = render.getLocalVB();
        const uintVData = render.getUintVB();
        const opacity = proxy.opacity * 255;
        const stride = render.floatStride;
        let offset = 0;
        const length = dataList.length;
        for (let i = 0; i < length; i++) {
            const curData = dataList[i];
            const color = ((curData.color & 0x00ffffff) | (opacity << 24)) >>> 0;
            offset = i * stride;
            uintVData[offset + 3] = color;
        }
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
