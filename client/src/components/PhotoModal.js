import { API_ENDPOINT, deleteImage } from '../api.js';
import { getScrollbarWidth } from '../utils/getScrollbarWidth.js';
import { toggleTabIndex } from '../utils/toggleTabIndex.js';

export default class PhotoModal {
  constructor({ $app, initialState, onClose, onArrowLeft, onArrowRight, onDelete }) {
    this.state = initialState;
    this.$target = document.createElement('div');
    this.onClose = onClose;
    this.onArrowLeft = onArrowLeft;
    this.onArrowRight = onArrowRight;
    this.onDelete = onDelete;

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

    this.$target.addEventListener('click', async (event) => {
      if (event.target.closest('.photo-modal__close-btn')) {
        this.onClose();
      } else if (event.target.closest('.photo-modal__move.left')) {
        this.onArrowLeft(this.state.currentPhoto.index);
      } else if (event.target.closest('.photo-modal__move.right')) {
        this.onArrowRight(this.state.currentPhoto.index);
      } else if (event.target.closest('.photo-modal__delete-btn')) {
        await deleteImage(this.state.currentPhoto.filePath);
        await this.onDelete();
      } else if (event.target.closest('.photo-modal__download-btn')) {
        const { filePath } = this.state.currentPhoto;
        const imagePath = encodeURI(`${API_ENDPOINT}/image/original/${filePath}`);
        const image = await fetch(imagePath);
        const imageBlob = await image.blob();
        const $tmp = document.createElement('a');
        $tmp.href = URL.createObjectURL(imageBlob);
        $tmp.download = filePath;
        document.body.appendChild($tmp);
        $tmp.click();
        document.body.removeChild($tmp);
      } else if (event.target.closest('.photo-modal__info-btn')) {
        const $photoInfoDetail = this.$target.querySelector('.photo-info__detail');
        if ($photoInfoDetail.classList.contains('visible')) $photoInfoDetail.classList.remove('visible');
        else $photoInfoDetail.classList.add('visible');

        const { dateTime, filePath, make, model, pixelXDimension, pixelYDimension } = this.state.currentPhoto;
        const getPixel = () => {
          const pixel = pixelXDimension * pixelYDimension;
          if (pixel > 1000000) return Math.round(pixel / 100000) / 10 + '백만';
          else if (pixel > 10000) return Math.round(pixel / 10000) + '만';
          return pixel;
        };

        $photoInfoDetail.innerHTML = `
          <li>${filePath}</li>
          <li>${dateTime}</li>
          <li>${getPixel()}화소, ${pixelXDimension}x${pixelYDimension}</li>
          ${make && model ? `<li>${make} ${model}</li>` : ''}
        `;
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
        <button class="photo-modal__close-btn" aria-label="사진 목록으로 돌아가기">
          <img src="./src/icons/arrow-left.svg" alt="닫기 아이콘">
        </button>
        <div class="photo-modal__top-right">
          <div class="photo-info">
            <button class="photo-modal__info-btn" aria-label="사진 정보 보기" title="정보">
              <img src="./src/icons/info.svg" alt="정보 아이콘">
            </button>
            <ul class="photo-info__detail"></ul>
          </div>
          <button class="photo-modal__download-btn" aria-label="사진 원본 다운로드" title="원본 다운로드">
            <img src="./src/icons/download.svg" alt="다운로드 아이콘">
          </button>
          <button class="photo-modal__delete-btn" aria-label="사진 삭제하기" title="삭제">
            <img src="./src/icons/trash.svg" alt="삭제 아이콘">
          </button>
        </div>
      </div>
      <div class="photo-modal__move left">
        <button class="photo-modal__arrow-btn" aria-label="이전 사진 보기">
          <img src="./src/icons/chevron-left.svg" alt="왼쪽 화살표 아이콘">
        </button>
      </div>
      <div class="photo-modal__move right">
        <button class="photo-modal__arrow-btn right" aria-label="다음 사진 보기">
          <img src="./src/icons/chevron-left.svg" alt="오른쪽 화살표 아이콘">
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
      if (window.innerHeight > document.body.clientHeight) {
        document.body.style.paddingRight = `${getScrollbarWidth()}px`;
      }
      this.$target.classList.remove('hidden');
      this.$target.classList.add('visible');
      this.$target.style = '';
      this.$target.style.top = `${window.scrollY}px`;
      this.$target.style.zIndex = 100;

      const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
      const { src } = $photo.querySelector('.photo__img');
      const $photoModalImg = this.$target.querySelector('.photo-modal__img');
      $photoModalImg.src = src;
      $photoModalImg.style = '';

      const expand = () => {
        $photoModalImg.src = `${src}?h=${this.maxSize.height}`;
        $photoModalImg.style.top = `${(window.innerHeight - this.maxSize.height) / 2}px`;
        $photoModalImg.style.left = `${(window.innerWidth - this.maxSize.width) / 2}px`;
        $photoModalImg.style.height = `${this.maxSize.height}px`;
        $photoModalImg.style.width = `${this.maxSize.width}px`;
      };

      if (this.state.isModalMoving) {
        expand();
      } else {
        const { offsetTop, offsetLeft, clientWidth, clientHeight } = $photo;
        $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
        $photoModalImg.style.left = `${offsetLeft}px`;
        $photoModalImg.style.height = `${clientHeight}px`;
        $photoModalImg.style.width = `${clientWidth}px`;
        setTimeout(() => {
          expand();
        }, 0);
      }
    }

    const $photoInfoDetail = this.$target.querySelector('.photo-info__detail');
    $photoInfoDetail.classList.remove('visible');
  }
}
