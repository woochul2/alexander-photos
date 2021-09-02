import { API_ENDPOINT } from '../api.js';
import { toggleTabIndex } from '../utils/toggleTabIndex.js';

export default class PhotoModal {
  constructor({ $app, initialState, onClose }) {
    this.state = initialState;
    this.$target = document.createElement('div');
    this.onClose = onClose;
    this.prevId;

    this.init($app);
  }

  get maxSize() {
    const { currentPhoto } = this.state;
    const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
    const { clientWidth, clientHeight } = $photo;
    const { pixelYDimension } = currentPhoto;

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
    this.$target.className = 'photo-modal';
    this.$target.classList.add('hidden');
    $app.appendChild(this.$target);
    this.render();

    this.$target.addEventListener('click', (event) => {
      if (event.target.closest('.photo-modal__close')) {
        this.onClose();
      }
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.animation();
  }

  render() {
    this.$target.innerHTML = `
      <img class="photo-modal__img">
      <div class="photo-modal__top">
        <button class="photo-modal__close" aria-label="사진 목록으로 돌아가기">
          <img src="./src/icons/arrow-left.svg" alt="닫기 아이콘">
        </button>
      </div>
    `;
  }

  animation() {
    const { currentPhoto } = this.state;
    if (!currentPhoto) {
      if (!this.prevId) return;
      const $photo = document.querySelector(`.photo[data-id="${this.prevId}"]`);
      const { offsetTop, offsetLeft, clientHeight } = $photo;
      const $photoModalImg = this.$target.querySelector('.photo-modal__img');
      document.body.style = '';
      this.$target.classList.remove('visible');
      this.$target.classList.add('hidden');
      this.$target.style.zIndex = '';
      $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
      $photoModalImg.style.left = `${offsetLeft}px`;
      $photoModalImg.style.height = `${clientHeight}px`;
      $photoModalImg.style.width = 'auto';
      toggleTabIndex();
    } else {
      this.prevId = currentPhoto._id;
      document.body.style.overflow = 'hidden';
      this.$target.classList.remove('hidden');
      this.$target.classList.add('visible');
      this.$target.style = '';
      this.$target.style.top = `${window.scrollY}px`;
      this.$target.style.zIndex = 100;

      const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
      const { offsetTop, offsetLeft, clientWidth, clientHeight } = $photo;
      const { src } = $photo.querySelector('.photo__img');
      const $photoModalImg = this.$target.querySelector('.photo-modal__img');
      $photoModalImg.src = src;
      $photoModalImg.style = '';
      $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
      $photoModalImg.style.left = `${offsetLeft}px`;
      $photoModalImg.style.height = `${clientHeight}px`;
      $photoModalImg.style.width = `${clientWidth}px`;

      setTimeout(() => {
        $photoModalImg.src = `${src}?h=${this.maxSize.height}`;
        $photoModalImg.style.top = `${(window.innerHeight - this.maxSize.height) / 2}px`;
        $photoModalImg.style.left = `${(window.innerWidth - this.maxSize.width) / 2}px`;
        $photoModalImg.style.height = `${this.maxSize.height}px`;
        $photoModalImg.style.width = `${this.maxSize.width}px`;
      }, 0);
    }
  }
}
