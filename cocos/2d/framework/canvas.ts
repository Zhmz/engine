/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2020 Xiamen Yaji Software Co., Ltd.

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

/**
 * @packageDocumentation
 * @module ui
 */

import { ccclass, help, disallowMultiple, executeInEditMode,
    executionOrder, menu, tooltip, type, serializable } from 'cc.decorator';
import { EDITOR } from 'internal:constants';
import { Camera } from '../../core/components/camera-component';
import { Widget } from '../../ui/widget';
import { game } from '../../core/game';
import { Size, Vec3 } from '../../core/math';
import { view } from '../../core/platform/view';
import { legacyCC } from '../../core/global-exports';
import { Enum } from '../../core/value-types/enum';
import visibleRect from '../../core/platform/visible-rect';
import { RenderRoot2D } from './render-root-2d';
import { Node, screen } from '../../core';
import { NodeEventType } from '../../core/scene-graph/node-event';
import { scale } from '../../primitive';
import { UITransform } from '.';

const _worldPos = new Vec3();

const RenderMode = Enum({
    OVERLAY: 0,
    INTERSPERSE: 1,
});

/**
 * @en
 * The root node of UI.
 * Provide an aligned window for all child nodes, also provides ease of setting screen adaptation policy interfaces from the editor.
 * Line-of-sight range is -999 to 1000.
 *
 * @zh
 * 作为 UI 根节点，为所有子节点提供对齐视窗，另外提供屏幕适配策略接口，方便从编辑器设置。
 * 注：由于本节点的尺寸会跟随屏幕拉伸，所以 anchorPoint 只支持 (0.5, 0.5)，否则适配不同屏幕时坐标会有偏差。
 * UI 的视距范围是 -999 ～ 1000.
 */
@ccclass('cc.Canvas')
@help('i18n:cc.Canvas')
@executionOrder(100)
@menu('UI/Canvas')
@executeInEditMode
@disallowMultiple
export class Canvas extends RenderRoot2D {
    /**
     * @en
     * The render mode of Canvas.
     * When you choose the mode of INTERSPERSE, You can specify the rendering order of the Canvas with the camera in the scene.
     * When you choose the mode of OVERLAY, the builtin camera of Canvas will render after all scene cameras are rendered.
     * NOTE: The cameras in the scene (including the Canvas built-in camera) must have a ClearFlag selection of SOLID_COLOR,
     * otherwise a splash screen may appear on the mobile device.
     *
     * @zh
     * Canvas 渲染模式。
     * intersperse 下可以指定 Canvas 与场景中的相机的渲染顺序，overlay 下 Canvas 会在所有场景相机渲染完成后渲染。
     * 注意：场景里的相机（包括 Canvas 内置的相机）必须有一个的 ClearFlag 选择 SOLID_COLOR，否则在移动端可能会出现闪屏。
     *
     * @deprecated since v3.0, please use [[cameraComponent.priority]] to control overlapping between cameras.
     */
    get renderMode () {
        return this._renderMode;
    }
    set renderMode (val) {
        this._renderMode = val;

        if (this._cameraComponent) {
            this._cameraComponent.priority = this._getViewPriority();
        }
    }

    @type(Camera)
    @tooltip('i18n:canvas.camera')
    get cameraComponent () {
        return this._cameraComponent;
    }

    set cameraComponent (value) {
        if (this._cameraComponent === value) { return; }

        this._cameraComponent = value;

        this._onResizeCamera();
    }

    @tooltip('i18n:canvas.align')
    get alignCanvasWithScreen () {
        return this._alignCanvasWithScreen;
    }

    set alignCanvasWithScreen (value) {
        this._alignCanvasWithScreen = value;

        this._onResizeCamera();
    }

    /**
     * @en
     * Size of design canvas.
     *
     * @zh
     * 设计分辨率。
     */
    @tooltip('i18n:canvas.design_resolution')
    get designResolution (): Size {
        return this._designResolution;
    }

    set designResolution (value) {
        if (this._designResolution.equals(value)) {
            return;
        }

        let clone: Size;
        if (EDITOR) {
            const uiTrans = this.node._uiProps.uiTransformComp;
            if (uiTrans) {
                clone = new Size(uiTrans.contentSize);
            }
        }

        this._designResolution.set(value);
        this._resizeCanvasUITransform();

        if (EDITOR) {
            // @ts-expect-error EDITOR condition
            this.node.emit(NodeEventType.SIZE_CHANGED, clone);
        } else {
            this.node.emit(NodeEventType.SIZE_CHANGED);
        }
    }

    get designWidth () {
        return this._designResolution.width;
    }

    set designWidth (value) {
        if (this.designResolution.width === value) {
            return;
        }

        let clone: Size;
        if (EDITOR) {
            const uiTrans = this.node._uiProps.uiTransformComp;
            if (uiTrans) {
                clone = new Size(uiTrans.contentSize);
            }
        }

        this._designResolution.width = value;
        this._resizeCanvasUITransform();

        if (EDITOR) {
            // @ts-expect-error EDITOR condition
            this.node.emit(NodeEventType.SIZE_CHANGED, clone);
        } else {
            this.node.emit(NodeEventType.SIZE_CHANGED);
        }

        console.error('modify design width');
    }

    get designHeight () {
        return this._designResolution.height;
    }

    set designHeight (value) {
        if (this.designResolution.height === value) {
            return;
        }

        let clone: Size;
        if (EDITOR) {
            const uiTrans = this.node._uiProps.uiTransformComp;
            if (uiTrans) {
                clone = new Size(uiTrans.contentSize);
            }
        }

        this._designResolution.height = value;
        this._resizeCanvasUITransform();

        if (EDITOR) {
            // @ts-expect-error EDITOR condition
            this.node.emit(NodeEventType.SIZE_CHANGED, clone);
        } else {
            this.node.emit(NodeEventType.SIZE_CHANGED);
        }

        console.error('modify design height');
    }

    // /**
    //  * @zh
    //  * 当前激活的画布组件，场景同一时间只能有一个激活的画布。
    //  */
    // public static instance: Canvas | null = null;

    @type(Camera)
    protected _cameraComponent: Camera | null = null;
    @serializable
    protected _alignCanvasWithScreen = true;

    protected _thisOnCameraResized: () => void;
    // fit canvas node to design resolution
    protected _fitDesignResolution: (() => void) | undefined;

    private _pos = new Vec3();
    private _renderMode = RenderMode.OVERLAY;

    @serializable
    protected _designResolution: Size = new Size(0, 0);

    constructor () {
        super();
        this._thisOnCameraResized = this._onResizeCamera.bind(this);

        //initialization
        if (this.designResolution.x === 0 && this.designResolution.y === 0) {
            this._designResolution = view.getDesignResolutionSize();
        }

        if (EDITOR) {
            this._fitDesignResolution = () => {
                // TODO: support paddings of locked widget
                this.node.getPosition(this._pos);
                const nodeSize = view.getDesignResolutionSize();
                Vec3.set(_worldPos, nodeSize.width * 0.5, nodeSize.height * 0.5, 0);

                if (!this._pos.equals(_worldPos)) {
                    this.node.setPosition(_worldPos);
                }
                const trans = this.node._uiProps.uiTransformComp!;
                if (trans.width !== nodeSize.width) {
                    trans.width = nodeSize.width;
                }
                if (trans.height !== nodeSize.height) {
                    trans.height = nodeSize.height;
                }
            };
        }
    }

    public __preload () {
        // Stretch to matched size during the scene initialization
        const widget = this.getComponent('cc.Widget') as unknown as Widget;
        if (widget) {
            widget.updateAlignment();
        } else if (EDITOR) {
            this._fitDesignResolution!();
        }

        if (!EDITOR) {
            if (this._cameraComponent) {
                this._cameraComponent._createCamera();
                this._cameraComponent.node.on(Camera.TARGET_TEXTURE_CHANGE, this._thisOnCameraResized);
            }
        }

        this._onResizeCamera();

        if (EDITOR) {
            // Constantly align canvas node in edit mode
            legacyCC.director.on(legacyCC.Director.EVENT_AFTER_UPDATE, this._fitDesignResolution!, this);

            // In Editor can not edit these attrs.
            // (Position in Node, contentSize in uiTransform)
            // (anchor in uiTransform, but it can edit, this is different from cocos creator)
            this._objFlags |= legacyCC.Object.Flags.IsPositionLocked | legacyCC.Object.Flags.IsSizeLocked | legacyCC.Object.Flags.IsAnchorLocked;
        }

        //这里需要保留，临时去掉，避免无限循环
        //this.node.on(NodeEventType.TRANSFORM_CHANGED, this._thisOnCameraResized);
    }

    public onEnable () {
        super.onEnable();
        if (!EDITOR && this._cameraComponent) {
            this._cameraComponent.node.on(Camera.TARGET_TEXTURE_CHANGE, this._thisOnCameraResized);
        }
    }

    public onDisable () {
        super.onDisable();
        if (this._cameraComponent) {
            this._cameraComponent.node.off(Camera.TARGET_TEXTURE_CHANGE, this._thisOnCameraResized);
        }
    }

    public onDestroy () {
        super.onDestroy();

        if (EDITOR) {
            legacyCC.director.off(legacyCC.Director.EVENT_AFTER_UPDATE, this._fitDesignResolution!, this);
        }

        this.node.off(NodeEventType.TRANSFORM_CHANGED, this._thisOnCameraResized);
    }

    // canvas 和 default design resolution 对齐
    protected _onResizeCameraOld () {
        if (this._cameraComponent && this._alignCanvasWithScreen) {
            if (this._cameraComponent.targetTexture) {
                this._cameraComponent.orthoHeight = visibleRect.height / 2;
            } else {
                const size = screen.windowSize;
                //原来的方案
                //this._cameraComponent.orthoHeight = size.height / view.getScaleY() / 2;

                //下面是先处理fit width的情况
                //camera和屏幕当前宽高比对齐，不修改camera高度，保证两个矩形相似而非全等（不考虑view.scaleY）
                const scaleCameraToScreen = this._cameraComponent.orthoHeight * 2 / size.height;
                //this._cameraComponent.orthoHeight = size.height / 2;

                const uiTrans = this.node._uiProps.uiTransformComp;
                if (uiTrans) {
                    console.error(`size.width = ${size.width}, size.height = ${size.height}`);
                    let scaleX = 1/* * scaleCameraToScreen*/;
                    //编辑器下不需要设置scale，此时screen.windowSize是编辑器scene窗口实时的尺寸，是用户设置可以自行拖拽的，没什么意义
                    //有意义的是运行状态下选择的分辨率，也是该字段screen.windowSize
                    if (!EDITOR) {
                        //运行模式下，根据当前宽的比进行缩放，将canvas的宽缩放到恰好填入camera矩形框（即屏幕矩形框）内
                        scaleX = (size.width / uiTrans.width) * scaleCameraToScreen;
                    }
                    //设置canvas的scale
                    this.node.scale = new Vec3(scaleX, scaleX, 1);
                    //因为camera目前直接生成在canvas下面，所以camera保持worldscale为1，localscale为canvasscale的倒数
                    this.cameraComponent!.node.scale = new Vec3(1 / scaleX, 1 / scaleX, 1);
                    console.error(`scale = ${scaleX}, real width = ${uiTrans.width * scaleX}, real height = ${uiTrans.height * scaleX}`);
                }
            }

            this.node.getWorldPosition(_worldPos);
            this._cameraComponent.node.setWorldPosition(_worldPos.x, _worldPos.y, 1000);
        }
    }

    // canvas 和 screen 和 camera 对齐
    protected _onResizeCamera () {
        if (this._cameraComponent && this._alignCanvasWithScreen) {
            const size = screen.windowSize;
            //下面是先处理fit width的情况
            //计算camera和屏幕的比例关系
            const scaleScreenToCamera = this._cameraComponent.orthoHeight * 2 / size.height;
            const uiTrans = this.node._uiProps.uiTransformComp;
            if (uiTrans) {
                //屏幕矩形框
                console.error(`screen width = ${size.width}, screen height = ${size.height}`);
                //摄影机矩形框
                console.error(`camera width = ${size.width * scaleScreenToCamera}, camera height = ${this._cameraComponent.orthoHeight * 2}`);
                //设计分辨率
                console.error(`design width = ${this.designResolution.width}, design height = ${this.designResolution.height}`);
                //因为是fit width，所以直接设置canvas宽度
                uiTrans.width = this.designResolution.width;
                //根据摄影机宽高比，计算出canvas高度
                uiTrans.height =  this.designResolution.width * this._cameraComponent.camera.height / this._cameraComponent.camera.width;
                //未缩放的canvas的宽高
                console.error(`uiTrans.width = ${uiTrans.width}, uiTrans.height = ${uiTrans.height}`);

                let scaleX = 1;
                //编辑器下不需要设置scale，此时screen.windowSize是编辑器scene窗口实时的尺寸，是用户设置可以自行拖拽的，没什么意义
                //有意义的是运行状态下选择的分辨率，也是该字段screen.windowSize
                if (!EDITOR) {
                    //运行模式下，根据当前宽的比进行缩放，将canvas的宽缩放到恰好填入屏幕矩形框内
                    const scaleCanvasToScreen = (size.width / uiTrans.width);
                    //继续缩放，将canvas填入摄影机矩形框
                    scaleX = scaleCanvasToScreen * scaleScreenToCamera;
                }
                //设置canvas的scale
                this.node.scale = new Vec3(scaleX, scaleX, 1);
                //因为camera目前直接生成在canvas下面，所以camera保持worldscale为1，localscale为canvasscale的倒数
                this.cameraComponent!.node.scale = new Vec3(1 / scaleX, 1 / scaleX, 1);
                console.error(`scale = ${scaleX}, calculated width = ${uiTrans.width * scaleX}, calculated height = ${uiTrans.height * scaleX}`);
            }

            this.node.getWorldPosition(_worldPos);
            this._cameraComponent.node.setWorldPosition(_worldPos.x, _worldPos.y, 1000);
        }
    }

    protected _resizeCanvasUITransform () {
        //先按fit width
        const uiTrans = this.node._uiProps.uiTransformComp;
        if (uiTrans) {
            uiTrans.width = this.designResolution.x;
            uiTrans.height = uiTrans.width * screen.windowSize.y / screen.windowSize.x;
        }
    }

    private _getViewPriority () {
        if (this._cameraComponent) {
            let priority = this.cameraComponent?.priority as number;
            priority = this._renderMode === RenderMode.OVERLAY ? priority | 1 << 30 : priority & ~(1 << 30);
            return priority;
        }

        return 0;
    }
}

legacyCC.Canvas = Canvas;
