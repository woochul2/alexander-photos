import { API_ENDPOINT } from '../api.js';
import { changePxToRem } from '../utils/changePxToRem.js';
import { changeRemToPx } from '../utils/changeRemToPx.js';
import { throttle } from '../utils/throttle.js';

export default class Photos {
  constructor({ $app, initialState, onClick }) {
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
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  get maxHeight() {
    if (window.innerWidth < changeRemToPx(37.5)) return 8.125;
    if (window.innerWidth < changeRemToPx(68.75)) return 12.5;
    return 15.625;
  }

  getPlaceHolderStyle(photo) {
    const { pixelXDimension, pixelYDimension, orientation } = photo;
    const getOriginalSize = () => {
      const pxd = changePxToRem(pixelXDimension);
      const pyd = changePxToRem(pixelYDimension);
      if (orientation >= 5 && orientation <= 8) return { x: pyd, y: pxd };
      return { x: pxd, y: pyd };
    };
    const { x, y } = getOriginalSize();
    const height = Math.min(this.maxHeight, y);
    const width = x / (y / height);
    return `height: ${height}rem; width: ${width}rem;`;
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo, index) => {
        const { _id, filePath } = photo;
        const imagePath = encodeURI(`${API_ENDPOINT}/image/${filePath}`);

        return `
          <button class="photo" data-id="${_id}" aria-label="사진 열기" onclick="this.blur();">
            <img 
              data-src=${imagePath}
              src="./src/assets/placeholder.png"
              class="photo__img"
              style="${this.getPlaceHolderStyle(photo)}"
              data-index="${index}"
            >
          </button>
        `;
      })
      .join('');

    const $photos = this.$target.querySelectorAll('.photo__img');
    $photos.forEach(($photo) => {
      const changeStyle = () => {
        const { index } = $photo.dataset;
        $photo.style = this.getPlaceHolderStyle(this.state.photos[index]);
      };

      const lazyLoad = throttle(() => {
        const rect = $photo.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          $photo.src = $photo.dataset.src;
          $photo.addEventListener('load', () => {
            $photo.removeAttribute('style');
          });
          window.removeEventListener('resize', changeStyle);
          window.removeEventListener('scroll', lazyLoad);
          window.removeEventListener('resize', lazyLoad);
        }
      }, 20);

      window.addEventListener('resize', changeStyle);
      window.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      lazyLoad();
    });
  }
}
