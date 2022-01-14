import { API_ENDPOINT } from '../api.js';
import { changeRemToPx } from '../utils/changeRemToPx.js';
import { getScrollbarWidth } from '../utils/getScrollbarWidth.js';
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

    const getTargetRowHeight = () => {
      if (window.innerWidth < changeRemToPx(68.75)) return changeRemToPx(12.5);
      return changeRemToPx(15.625);
    };

    const getContainerPadding = () => {
      if (window.innerWidth < changeRemToPx(37.5)) {
        return {
          top: changeRemToPx(0.375),
          right: 0,
          bottom: changeRemToPx(0.375),
          left: 0,
        };
      }
      if (window.innerWidth < changeRemToPx(68.75)) return changeRemToPx(0.375);
      return changeRemToPx(0.625);
    };

    const config = {
      containerWidth: window.innerWidth - getScrollbarWidth(),
      targetRowHeight: getTargetRowHeight(),
      boxSpacing: changeRemToPx(0.25),
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
        const imagePath = encodeURI(`${API_ENDPOINT}/image/${filePath}?h=${height}`);

        return `
          <button 
            class="photo" 
            data-id="${_id}" 
            aria-label="사진 열기" 
            onclick="this.blur();"
            style="height: ${Math.floor(height)}px; width: ${width}px; top: ${top}px; left: ${left}px;"
          >
            <img
              data-src=${imagePath}
              src="./src/assets/placeholder.png"
              class="photo__img"
              data-index="${index}"
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
            const $photoButton = $photo.closest('.photo');
            $photoButton.style.width = '';
          });
          this.$app.removeEventListener('scroll', lazyLoad);
          window.removeEventListener('resize', lazyLoad);
          window.removeEventListener('orientationchange', orientationChangeEvent);
        }
      }, 20);

      const orientationChangeEvent = () => {
        setTimeout(() => {
          lazyLoad;
        }, 1);
      };

      this.$app.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      window.addEventListener('orientationchange', orientationChangeEvent);
      lazyLoad();
    });
  }
}
