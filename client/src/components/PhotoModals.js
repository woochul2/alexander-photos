import { API_ENDPOINT } from '../api.js';
import { toggleTabIndex } from '../utils/toggleTabIndex.js';

export default class PhotoModals {
  constructor({ $app, initialState, onClose }) {
    this.state = initialState;
    this.$target = document.createElement('div');
    this.onClose = onClose;
    this.prevId;

    this.init($app);
  }

  get maxSize() {
    const { currentId } = this.state;
    const $photo = document.querySelector(`.photo[data-id="${currentId}"]`);
    const { clientWidth, clientHeight } = $photo;
    const { pixelYDimension } = this.state.photos.find((photo) => photo._id === currentId);

    let height = Math.min(window.innerHeight, pixelYDimension);
    let scaleRatio = height / clientHeight;
    let width = clientWidth * scaleRatio;

    if (width > window.innerWidth) {
      width = window.innerWidth;
      scaleRatio = width / clientWidth;
      height = clientHeight * scaleRatio;
    }

    return {
      width,
      height,
    };
  }

  init($app) {
    this.$target.className = 'photo-modals';
    $app.appendChild(this.$target);

    this.$target.addEventListener('click', (event) => {
      if (event.target.closest('.photo-modal__close')) {
        this.onClose();
      }
    });
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };
    const has = (property) => nextState.hasOwnProperty(property);
    if (has('photos')) {
      this.render();
    } else if (has('currentId')) {
      this.animation();
    }
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo) => {
        return `
          <div class="photo-modal hidden" data-id="${photo._id}">
            <img src="${encodeURI(`${API_ENDPOINT}/image/${photo.filePath}`)}" class="photo-modal__img">
            <div class="photo-modal__top">
              <button class="photo-modal__close" aria-label="사진 목록으로 돌아가기">
                <img src="./src/icons/arrow-left.svg" alt="닫기 아이콘">
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  animation() {
    const { currentId } = this.state;
    if (currentId === null) {
      const $photoModal = document.querySelector(`.photo-modal[data-id="${this.prevId}"]`);
      const $photo = document.querySelector(`.photo[data-id="${this.prevId}"]`);
      const { offsetTop, offsetLeft, clientHeight } = $photo;
      const $photoModalImg = $photoModal.querySelector('.photo-modal__img');
      document.body.style = '';
      $photoModal.classList.remove('visible');
      $photoModal.classList.add('hidden');
      $photoModal.style.zIndex = '';
      $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
      $photoModalImg.style.left = `${offsetLeft}px`;
      $photoModalImg.style.height = `${clientHeight}px`;
      $photoModalImg.style.width = 'auto';
      toggleTabIndex();
    } else {
      this.prevId = currentId;
      const $photoModal = document.querySelector(`.photo-modal[data-id="${currentId}"]`);
      document.body.style.overflow = 'hidden';
      $photoModal.classList.remove('hidden');
      $photoModal.classList.add('visible');
      $photoModal.style = '';
      $photoModal.style.top = `${window.scrollY}px`;
      $photoModal.style.zIndex = 100;

      const $photo = document.querySelector(`.photo[data-id="${currentId}"]`);
      const { offsetTop, offsetLeft, clientWidth, clientHeight } = $photo;
      const { src } = $photo.querySelector('.photo__img');
      const $photoModalImg = $photoModal.querySelector('.photo-modal__img');
      $photoModalImg.style = '';
      $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
      $photoModalImg.style.left = `${offsetLeft}px`;
      $photoModalImg.style.height = `${clientHeight}px`;
      $photoModalImg.style.width = `${clientWidth}px`;
      $photoModalImg.src = `${src}?h=${this.maxSize.height}`;

      setTimeout(() => {
        $photoModalImg.style.top = `${(window.innerHeight - this.maxSize.height) / 2}px`;
        $photoModalImg.style.left = `${(window.innerWidth - this.maxSize.width) / 2}px`;
        $photoModalImg.style.height = `${this.maxSize.height}px`;
        $photoModalImg.style.width = `${this.maxSize.width}px`;
      }, 0);
    }
  }
}
