import { API_ENDPOINT, deleteImage } from '../api.js';
import { getScrollbarWidth } from '../utils/getScrollbarWidth.js';
import { toggleClass } from '../utils/toggleClass.js';
import { toggleMainTabIndex } from '../utils/toggleMainTabIndex.js';

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

  get clickEvents() {
    return {
      close: () => {
        this.onClose();
      },
      moveLeft: () => {
        this.onArrowLeft(this.state.currentPhoto.index);
      },
      moveRight: () => {
        this.onArrowRight(this.state.currentPhoto.index);
      },
      delete: () => {
        const $photoDeleteConfirm = this.$target.querySelector('.photo-delete-confirm');
        toggleClass($photoDeleteConfirm, 'visible');
      },
      cancelDelete: () => {
        const $photoDeleteConfirm = this.$target.querySelector('.photo-delete-confirm');
        $photoDeleteConfirm.classList.remove('visible');
      },
      confirmDelete: async () => {
        await deleteImage(this.state.currentPhoto.filePath);
        await this.onDelete();
        const $photoModalImg = this.$target.querySelector('.photo-modal__img');
        $photoModalImg.src = '';
      },
      download: async () => {
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
      },
      info: () => {
        const $photoInfoDetail = this.$target.querySelector('.photo-info__detail');
        toggleClass($photoInfoDetail, 'visible');
        const { dateTime, filePath, make, model, orientation, pixelXDimension, pixelYDimension } =
          this.state.currentPhoto;

        const getDateTime = () => {
          const matchResult = dateTime.match(
            /(?<year>\w+):(?<month>\w+):(?<date>\w+) (?<hours>\w+):(?<seconds>\w+):(\w+)/
          );
          const { year, month, date, hours, seconds } = matchResult.groups;
          return `${year}년 ${parseInt(month)}월 ${parseInt(date)}일 ${hours}:${seconds}`;
        };

        const getPixel = () => {
          const pixel = pixelXDimension * pixelYDimension;
          if (pixel > 1000000) return Math.round(pixel / 100000) / 10 + '백만';
          else if (pixel > 10000) return Math.round(pixel / 10000) + '만';
          return pixel;
        };

        const getPixelDimension = () => {
          if (orientation >= 5 && orientation <= 8) return `${pixelYDimension}x${pixelXDimension}`;
          return `${pixelXDimension}x${pixelYDimension}`;
        };

        $photoInfoDetail.innerHTML = `
          <li><b>이름</b>: ${filePath}</li>
          <li><b>생성 날짜</b>: ${getDateTime()}</li>
          <li><b>해상도</b>: ${getPixel()} 화소 (${getPixelDimension()})</li>
          ${make && model ? `<li><b>카메라 모델</b>: ${make} ${model}</li>` : ''}
        `;
      },
    };
  }

  init($app) {
    this.$target.className = 'photo-modal';
    this.$target.classList.add('hidden');
    $app.appendChild(this.$target);
    this.render();

    this.$target.addEventListener('click', async (event) => {
      if (event.target.closest('.photo-modal__close-btn')) this.clickEvents.close();
      else if (event.target.closest('.photo-modal__move.left')) this.clickEvents.moveLeft();
      else if (event.target.closest('.photo-modal__move.right')) this.clickEvents.moveRight();
      else if (event.target.closest('.photo-delete__btn')) this.clickEvents.delete();
      else if (event.target.closest('.photo-delete-confirm__cancel-btn')) this.clickEvents.cancelDelete();
      else if (event.target.closest('.photo-delete-confirm__delete-btn')) await this.clickEvents.confirmDelete();
      else if (event.target.closest('.photo-modal__download-btn')) await this.clickEvents.download();
      else if (event.target.closest('.photo-info__btn')) this.clickEvents.info();
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.playAnimation();
  }

  render() {
    this.$target.innerHTML = `
      <img class="photo-modal__img">
      <div class="photo-modal__top">
        <button class="btn photo-modal__close-btn" aria-label="사진 목록으로 돌아가기">
          <img src="./src/icons/arrow-left.svg" alt="닫기 아이콘">
        </button>
        <div class="photo-modal__top-right">
          <div class="photo-info">
            <button class="btn photo-info__btn" aria-label="사진 정보 보기" title="정보">
              <img src="./src/icons/info.svg" alt="정보 아이콘">
            </button>
            <ul class="photo-info__detail"></ul>
          </div>
          <button class="btn photo-modal__download-btn" aria-label="사진 원본 다운로드" title="원본 다운로드">
            <img src="./src/icons/download.svg" alt="다운로드 아이콘">
          </button>
          <div class="photo-delete">
            <button class="btn photo-delete__btn" aria-label="사진 삭제하기" title="삭제">
              <img src="./src/icons/trash.svg" alt="삭제 아이콘">
            </button>
            <div class="photo-delete-confirm">
              <p class="photo-delete-confirm__description">삭제 후 이미지는 복구할 수 없습니다. 그래도 삭제하시겠습니까?</p>
              <div class="photo-delete-confirm__buttons">
                <button class="photo-delete-confirm__cancel-btn">취소</button>
                <button class="photo-delete-confirm__delete-btn">삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="photo-modal__move left">
        <button class="btn photo-modal__arrow-btn" aria-label="이전 사진 보기">
          <img src="./src/icons/chevron-left.svg" alt="왼쪽 화살표 아이콘">
        </button>
      </div>
      <div class="photo-modal__move right">
        <button class="btn photo-modal__arrow-btn right" aria-label="다음 사진 보기">
          <img src="./src/icons/chevron-left.svg" alt="오른쪽 화살표 아이콘">
        </button>
      </div>
    `;
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

  get animations() {
    return {
      shrink: () => {
        if (!this.prevPhoto) return;
        const $photo = document.querySelector(`.photo[data-id="${this.prevPhoto._id}"]`);
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
        toggleMainTabIndex();
      },
      expand: () => {
        const { currentPhoto } = this.state;
        if (!currentPhoto) return;
        if (window.innerHeight < document.body.clientHeight) {
          document.body.style.paddingRight = `${getScrollbarWidth()}px`;
        }
        document.body.style.overflow = 'hidden';
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

        const { offsetTop, offsetLeft, clientWidth, clientHeight } = $photo;
        $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
        $photoModalImg.style.left = `${offsetLeft}px`;
        $photoModalImg.style.height = `${clientHeight}px`;
        $photoModalImg.style.width = `${clientWidth}px`;

        setTimeout(() => {
          $photoModalImg.src = `${src}?h=${this.maxSize.height}`;
          $photoModalImg.style.transition = 'all var(--transition-duration) var(--transition-timing-function)';
          $photoModalImg.style.top = `${(window.innerHeight - this.maxSize.height) / 2}px`;
          $photoModalImg.style.left = `${(window.innerWidth - this.maxSize.width) / 2}px`;
          $photoModalImg.style.height = `${this.maxSize.height}px`;
          $photoModalImg.style.width = `${this.maxSize.width}px`;
        }, 0);
      },
      move: () => {
        const { currentPhoto } = this.state;
        if (!currentPhoto) return;
        const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
        const { src } = $photo.querySelector('.photo__img');
        const $photoModalImg = this.$target.querySelector('.photo-modal__img');
        $photoModalImg.src = src;
        $photoModalImg.style = '';
        $photoModalImg.style.top = `${(window.innerHeight - this.maxSize.height) / 2}px`;
        $photoModalImg.style.height = `${this.maxSize.height}px`;
        $photoModalImg.style.width = `${this.maxSize.width}px`;
        $photoModalImg.style.opacity = 0.7;

        const targetLeft = (window.innerWidth - this.maxSize.width) / 2;
        if (this.prevPhoto.index > currentPhoto.index) $photoModalImg.style.left = `${targetLeft - 50}px`;
        else $photoModalImg.style.left = `${targetLeft + 50}px`;

        setTimeout(() => {
          $photoModalImg.src = `${src}?h=${this.maxSize.height}`;
          $photoModalImg.style.transition = 'all var(--transition-duration) var(--transition-timing-function)';
          $photoModalImg.style.left = `${targetLeft}px`;
          $photoModalImg.style.opacity = 1;
        }, 0);
      },
    };
  }

  playAnimation() {
    const { currentPhoto } = this.state;
    if (!currentPhoto) this.animations.shrink();
    else if (this.state.isModalMoving) this.animations.move();
    else this.animations.expand();

    const $photoInfoDetail = this.$target.querySelector('.photo-info__detail');
    $photoInfoDetail.classList.remove('visible');
    const $photoDeleteConfirm = this.$target.querySelector('.photo-delete-confirm');
    $photoDeleteConfirm.classList.remove('visible');
    this.prevPhoto = { ...currentPhoto };
  }
}
