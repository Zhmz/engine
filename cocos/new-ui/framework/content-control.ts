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

import { Rect, Size, Vec2 } from '../../core';
import { ContainerElement } from '../base/container-element';
import { UIElement, Visibility } from '../base/ui-element';
import { UILayout } from '../base/ui-layout';
import { assertIsNonNullable } from '../../core/data/utils/asserts';
import { Enum } from '../../core/value-types';
import { AdvancedProperty } from '../base/advanced-property';
import { Thickness } from '../base/thickness';

export enum HorizontalAlignment {
    LEFT,
    CENTER,
    RIGHT,
    STRETCH
}

export enum VerticalAlignment {
    TOP,
    CENTER,
    BOTTOM,
    STRETCH
}

export class ContentLayout extends UILayout {
    public static HorizontalAlignmentProperty = AdvancedProperty.register('HorizontalAlignment',
        Enum(HorizontalAlignment), ContentLayout, HorizontalAlignment.CENTER);
    public static VerticalAlignmentProperty = AdvancedProperty.register('VerticalAlignment',
        Enum(VerticalAlignment), ContentLayout, HorizontalAlignment.CENTER);
    public static MarginProperty = AdvancedProperty.register('Margin', Thickness, ContentLayout, Thickness.ZERO);

    get horizontalAlignment () {
        return this.getValue(ContentLayout.HorizontalAlignmentProperty) as HorizontalAlignment;
    }

    set horizontalAlignment (val) {
        this.element.invalidateParentArrange();
        this.setValue(ContentLayout.HorizontalAlignmentProperty, val);
    }

    get verticalAlignment () {
        return this.getValue(ContentLayout.VerticalAlignmentProperty) as VerticalAlignment;
    }

    set verticalAlignment (val) {
        this.element.invalidateParentArrange();
        this.setValue(ContentLayout.VerticalAlignmentProperty, val);
    }

    get margin () {
        return this.getValue(ContentLayout.MarginProperty) as Thickness;
    }

    set margin (val: Thickness) {
        this.element.invalidateParentMeasure();
        this.element.invalidateParentArrange();
        this.setValue(ContentLayout.MarginProperty, val);
    }
}

export class ContentControl extends ContainerElement {
    get content (): UIElement | null {
        return this.childCount > 0 ? this._children[0] : null;
    }

    set content (element: UIElement | null) {
        if (element) {
            this.addChild(element);
        } else {
            this.clearChildren();
        }
    }

    public addChild (element: UIElement) {
        this.clearChildren();
        super.addChild(element);
    }

    public allowMultipleChild () {
        return false;
    }

    protected getLayoutClass (): typeof UILayout {
        return ContentLayout;
    }

    protected computeDesiredSize () {
        const desiredSize = new Size();
        const content = this.content;
        if (content) {
            content.measure();
            const { width: marginWidth, height: marginHeight } = (content.layout as ContentLayout).margin;
            desiredSize.set(content.desiredSize.width + marginWidth, content.desiredSize.height + marginHeight);
        }
        return desiredSize;
    }

    protected arrangeContent (arrangeSize: Size) {
        const content = this.content;
        if (content) {
            if (content.visibility !== Visibility.COLLAPSED) {
                const childRect = new Rect();
                const contentLayout = content.layout as ContentLayout;
                assertIsNonNullable(contentLayout);
                const { left: marginLeft, bottom: marginBottom, width: marginWidth, height: marginHeight } = contentLayout.margin;
                if (contentLayout.horizontalAlignment === HorizontalAlignment.STRETCH) {
                    childRect.width = arrangeSize.width;
                } else {
                    childRect.width = content.desiredSize.width + marginWidth;
                }

                if (contentLayout.verticalAlignment === VerticalAlignment.STRETCH) {
                    childRect.height = arrangeSize.height;
                } else {
                    childRect.height = content.desiredSize.height + marginHeight;
                }

                childRect.center = new Vec2(0, 0);

                switch (contentLayout.horizontalAlignment) {
                case HorizontalAlignment.LEFT:
                    childRect.x = -arrangeSize.width / 2;
                    break;
                case HorizontalAlignment.RIGHT:
                    childRect.x = arrangeSize.width / 2 - childRect.width;
                    break;
                default:
                    break;
                }

                switch (contentLayout.verticalAlignment) {
                case VerticalAlignment.TOP:
                    childRect.y = arrangeSize.height / 2  - childRect.height;
                    break;
                case VerticalAlignment.BOTTOM:
                    childRect.y = -arrangeSize.height / 2;
                    break;
                default:
                    break;
                }
                childRect.x += marginLeft;
                childRect.y += marginBottom;
                childRect.width = Math.max(childRect.width - marginWidth, 0);
                childRect.height = Math.max(childRect.height - marginHeight, 0);
                content.arrange(childRect);
            }
        }
    }
}
