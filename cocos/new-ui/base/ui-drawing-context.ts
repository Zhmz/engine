
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

import { Rect, Color } from '../../core/math';
import { SpriteFrame } from '../../2d/assets/sprite-frame';
import { Material } from '../../core/assets/material';
import { VisualProxy, VisualRenderProxy } from '../rendering/visual-proxy';
import { UIElement } from './ui-element';
import { Model } from '../../core/renderer/scene';
import { legacyCC } from '../../core/global-exports';
import { scene } from '../../core/renderer';
import { getAttributeStride, vfmtPosColor4B } from '../../2d/renderer/vertex-format';
import { Attribute, Buffer, BufferInfo, BufferUsageBit, Device, DeviceManager, deviceManager, MemoryUsageBit, PrimitiveMode } from '../../core/gfx';
import { Camera, RenderingSubMesh } from '../../core';
import { jsxAttribute } from '@babel/types';
import { attr } from '../../core/data/utils/attribute';

export enum BrushType {
    IMAGE,
    MATERIAL,
}

// drawContext 为一个 canvas 所持有的上下文，那么其负责提供了 draw方法和 PainterParameters 结构
// 在上层进行了paint命令之后，进行方法的提供和 visualProxy 的数据填充
export class IDrawingContext {

    private visualProxyQueue: VisualProxy[] = []; // 用这个来渲染？// 应该不用双层？
    private _bufferPool : BufferPool; // todo
    private _contextModel :Model;
    private _subModelIndex = 0;

    // batch used
    private _currVerticesData = new Float32Array();
    private _currIndicesData = new Uint16Array();
    private _currAtt: Attribute[] = [];

    constructor () {
        this._createModel(); // only model,not have subModel
        this._bufferPool = new BufferPool(vfmtPosColor4B);

    }

    public drawRect(painterParams: IRectPainterParameters) {
        let visualProxy = painterParams.uiElement._visualProxy!;
        // init renderData
        visualProxy.initVisualRender(4, 6, painterParams.color, painterParams.rect);
        if (!this.visualProxyQueue.includes(visualProxy)) {
            this.visualProxyQueue.push(visualProxy); // 双层结构？可能不太好 意义不大
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
        let len = this.visualProxyQueue.length;
        for (let i = 0; i < len; i++) {
            let visualProxy = this.visualProxyQueue[i]._visualRenderArr;
            let len = visualProxy.length;
            for (let j = 0; j < len; j++) {
                let render = visualProxy[j];
                // todo 合批判断 可以利用 dataHash 之类的
                if (false) { // 打断合批
                    this._createSubMesh(render);
                    this._subModelIndex++;
                } else { // 可以合批
                    this._currAtt = render.attribute;
                    this._currVerticesData +=; //拼数组？// 还得检查能不能拼得下？
                    this._currIndicesData +=;
                }
            }
        }
    }

    public getContextModel () {
        return this._contextModel; 
    }

    private _createModel () {
        if (!this._contextModel) {
            this._contextModel = legacyCC.director.root.createModel(scene.Model);
        }
    }

    // 应该传入多个对象，进行顶点合并了
    private _createSubMesh (render: VisualRenderProxy) {

        const bufferInfo = this._bufferPool.requireBuffer();
        const vertexBuffers = bufferInfo.vertexBuffers;
        const indexBuffer = bufferInfo.indexBuffer;
        const attr = bufferInfo.attributes;

        // 能取段了// 后两个参数为范围// 之要不是超范围就行
        // 甚至可以直接用 vertex 数组即可
        const verticesData = new Float32Array(this._currVerticesData.buffer, 0, byteCount >> 2); 
        // 同样为范围 // 取一段就行
        const indicesData = new Uint16Array(this._currIndicesData.buffer, 0, indexCount);
        
        vertexBuffers[0].update(verticesData); // 原生上要给个范围，不然会崩？
        
        const ib = this._currIndicesData;
        indexBuffer.update(ib);

        // mesh 重建
        const submesh = new RenderingSubMesh(vertexBuffers, attr, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
        submesh.subMeshIdx = this._subModelIndex; //可以没有

        this._contextModel.initSubModel(this._subModelIndex, submesh, render.getMaterial()!);// heavy & slow todo
        this._contextModel.enabled = true;
    }
}

export class IRectPainterParameters { // world trs 不在此结构中，另外参数传入
    rect: Rect;
    color: Color;
    uiElement: UIElement;

    public static getDefault(uie: UIElement) {
        let painterParams = new IRectPainterParameters();
        painterParams.rect = uie.layout;
        painterParams.color = Color.WHITE;
        painterParams.uiElement = uie;
        return painterParams;
    }
}

export interface IBrushPainterParameters { // not finish
    rect: Rect;
    color: Color;
    type: BrushType;
    sprite: SpriteFrame;
    material: Material;
}

export interface ITextPainterParameters { // not finish
    rect: Rect;
    color: Color;
    text: string;
    font: string;
    fontSize: number;
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
