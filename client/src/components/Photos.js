import { API_ENDPOINT } from '../api.js';
import { BREAKPOINTS, MAX_WIDTH } from '../constants.js';
import { changePxToRem } from '../utils/changePxToRem.js';
import { changeRemToPx } from '../utils/changeRemToPx.js';
import { getScrollbarWidth } from '../utils/getScrollbarWidth.js';
import { getWindowHeight } from '../utils/getWindowHeight.js';
import { throttle } from '../utils/throttle.js';
const justifiedLayout = require('justified-layout');

export default class Photos {
  constructor({ $app, initialState, onClick }) {
    this.$app = $app;
    this.state = initialState;
    this.$target = document.createElement('div');
    this.onClick = onClick;

    this.init($app);
  }

  init($app) {
    this.$target.className = 'photos';
    $app.appendChild(this.$target);
    this.render();

    this.$target.addEventListener('click', (event) => {
      const $photo = event.target.closest('.photo');
      if (!$photo) return;
      const photo = this.state.photos.find((photo) => photo._id === $photo.dataset.id);
      this.onClick(photo);
    });

    const resizeEvent = () => {
      this.render();
    };

    window.addEventListener('resize', resizeEvent);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        resizeEvent();
      }, 1);
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  get geometry() {
    const sizes = this.state.photos.map((photo) => {
      if (photo.orientation >= 5 && photo.orientation <= 8) {
        return {
          width: photo.pixelYDimension,
          height: photo.pixelXDimension,
        };
      }

      return {
        width: photo.pixelXDimension,
        height: photo.pixelYDimension,
      };
    });

    const bodyRemWidth = changePxToRem(document.body.clientWidth);
    const containerWidth = document.body.clientWidth - getScrollbarWidth();

    const getTargetRowHeight = () => {
      const getResult = (remValue) => Math.min(getWindowHeight() / 2, changeRemToPx(remValue));

      if (bodyRemWidth < BREAKPOINTS.SM) return getResult(20);
      if (bodyRemWidth < BREAKPOINTS.LG) return getResult(23.125);
      if (bodyRemWidth < BREAKPOINTS.XL) return getResult(25);
      return getResult(28.125);
    };

    const getBoxSpacing = () => {
      if (bodyRemWidth < BREAKPOINTS.LG) return changeRemToPx(0.25);
      return changeRemToPx(0.5);
    };

    const getContainerPadding = () => {
      const getResult = (verticalRem, horizontalRem) => {
        const vertical = changeRemToPx(verticalRem);
        const horizontal = Math.max(changeRemToPx(horizontalRem), (containerWidth - changeRemToPx(MAX_WIDTH)) / 2);

        return {
          top: vertical,
          right: horizontal,
          bottom: vertical,
          left: horizontal,
        };
      };

      if (bodyRemWidth < BREAKPOINTS.SM) return getResult(0.375, 0);
      if (bodyRemWidth < BREAKPOINTS.LG) return getResult(0.75, 0.375);
      if (bodyRemWidth < BREAKPOINTS.XL) return getResult(1.125, 0.5);
      return getResult(1.5, 1);
    };

    const config = {
      containerWidth,
      targetRowHeight: getTargetRowHeight(),
      boxSpacing: getBoxSpacing(),
      containerPadding: getContainerPadding(),
    };

    return justifiedLayout(sizes, config);
  }

  render() {
    this.$target.style.height = `${this.geometry.containerHeight}px`;

    this.$target.innerHTML = this.state.photos
      .map((photo, index) => {
        const { _id, filePath } = photo;
        const { width, height, top, left } = this.geometry.boxes[index];
        const imagePath = encodeURI(`${API_ENDPOINT}/image/${filePath}?h=${height * window.devicePixelRatio}`);

        return `
          <button 
            class="photo" 
            data-id="${_id}" 
            aria-label="사진 열기" 
            onclick="this.blur();"
            style="top: ${top}px; left: ${left}px;"
          >
            <img
              data-src=${imagePath}
              src="./src/assets/placeholder.png"
              class="photo__img"
              data-index="${index}"
              style="height: ${Math.floor(height)}px; width: ${width}px;"
            >
          </button>
        `;
      })
      .join('');

    const $photoImgs = this.$target.querySelectorAll('.photo__img');
    $photoImgs.forEach(($photo) => {
      const lazyLoad = throttle(() => {
        const rect = $photo.getBoundingClientRect();
        if (rect.top < this.$app.clientHeight + 300) {
          $photo.src = $photo.dataset.src;
          $photo.addEventListener('load', () => {
            $photo.style.width = '';
          });
          this.$app.removeEventListener('scroll', lazyLoad);
          window.removeEventListener('resize', lazyLoad);
          window.removeEventListener('orientationchange', orientationChangeEvent);
        }
      }, 20);

      const orientationChangeEvent = () => {
        setTimeout(() => {
          lazyLoad();
        }, 1);
      };

      this.$app.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      window.addEventListener('orientationchange', orientationChangeEvent);
      lazyLoad();
    });
  }
}
