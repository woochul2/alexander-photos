import justifiedLayout from 'justified-layout';
import { BREAKPOINTS, MAX_WIDTH } from '../constants';
import getScrollbarWidth from './getScrollbarWidth';
import getWindowHeight from './getWindowHeight';
import pxToRem from './pxToRem';
import remToPx from './remToPx';

const geometry = {
  containerWidth: 0,
  bodyRemWidth: 0,

  get targetRowHeight() {
    const base = getWindowHeight() / 2;
    const getResult = (remValue) => Math.min(base, remToPx(remValue));

    if (this.bodyRemWidth < BREAKPOINTS.sm) return getResult(20);
    if (this.bodyRemWidth < BREAKPOINTS.lg) return getResult(23.125);
    if (this.bodyRemWidth < BREAKPOINTS.xl) return getResult(25);
    return getResult(28.125);
  },

  get boxSpacing() {
    if (this.bodyRemWidth < BREAKPOINTS.lg) return remToPx(0.25);
    return remToPx(0.5);
  },

  get containerPadding() {
    const getResult = (verticalRem, horizontalRem) => {
      const vertical = remToPx(verticalRem);
      const base = (this.containerWidth - remToPx(MAX_WIDTH)) / 2;
      const horizontal = Math.max(base, remToPx(horizontalRem));

      return {
        top: vertical,
        right: horizontal,
        bottom: vertical,
        left: horizontal,
      };
    };

    if (this.bodyRemWidth < BREAKPOINTS.sm) return getResult(0.375, 0);
    if (this.bodyRemWidth < BREAKPOINTS.lg) return getResult(0.75, 0.375);
    if (this.bodyRemWidth < BREAKPOINTS.xl) return getResult(1.125, 0.5);
    return getResult(1.5, 1);
  },

  get config() {
    // prettier-ignore
    const { containerWidth, targetRowHeight, boxSpacing, containerPadding } = this;

    return {
      containerWidth,
      targetRowHeight,
      boxSpacing,
      containerPadding,
    };
  },

  /**
   * 모든 사진에 justifiedLayout을 적용한 결과를 반환한다.
   *
   * @param {Photo[]} photos
   */
  main(photos) {
    const rootWidth = document.documentElement.clientWidth;
    this.containerWidth = rootWidth - getScrollbarWidth();
    this.bodyRemWidth = pxToRem(rootWidth);

    const sizes = photos.map(({ width, height }) => ({ width, height }));
    return justifiedLayout(sizes, this.config);
  },
};

export default geometry;
