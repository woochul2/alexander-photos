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

  get maxSize() {
    const { currentPhoto } = this.state;
    const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
    const { width, height } = $photo.getBoundingClientRect();
    const { pixelYDimension } = currentPhoto;

    const result = { width: 0, height: 0 };
    result.height = Math.min(window.innerHeight, pixelYDimension);
    let scaleRatio = result.height / height;
    result.width = width * scaleRatio;

    if (result.width > window.innerWidth) {
      result.width = window.innerWidth;
      scaleRatio = result.width / width;
      result.height = height * scaleRatio;
    }

    return result;
  }

  maximizeImg() {
    const { currentPhoto } = this.state;
    if (!currentPhoto) return;
    const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
    const { top, left, height, width } = $photo.getBoundingClientRect();
    const $photoModalImg = this.$target.querySelector('.photo-modal__img');
    const { src } = $photo.querySelector('.photo__img');
    $photoModalImg.src = `${src}?h=${this.maxSize.height}`;
    $photoModalImg.style.top = `${top}px`;
    $photoModalImg.style.left = `${left}px`;
    $photoModalImg.style.height = `${height}px`;
    $photoModalImg.style.width = `${width}px`;
    const translateX = (window.innerWidth - width) / 2 - left;
    const translateY = (window.innerHeight - height) / 2 - top;
    const translate = `translate(${translateX}px, ${translateY}px)`;
    const scale = `scale(${this.maxSize.height / height})`;
    $photoModalImg.style.transform = `${translate} ${scale}`;
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

    window.addEventListener('resize', () => {
      this.$target.style.top = `${window.scrollY}px`;
      const $photoModalImg = this.$target.querySelector('.photo-modal__img');
      const tmp = $photoModalImg.style.transition;
      $photoModalImg.style.transition = '';
      this.maximizeImg();
      setTimeout(() => {
        $photoModalImg.style.transition = tmp;
      }, 0);
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

  get animations() {
    return {
      shrink: () => {
        if (!this.prevPhoto) return;
        const $photoModalImg = this.$target.querySelector('.photo-modal__img');
        this.$target.classList.remove('visible');
        this.$target.classList.add('hidden');
        this.$target.style.zIndex = '';

        const $photo = document.querySelector(`.photo[data-id="${this.prevPhoto._id}"]`);
        const { top, left, height, width } = $photo.getBoundingClientRect();
        $photoModalImg.style.top = `${top}px`;
        $photoModalImg.style.left = `${left}px`;
        $photoModalImg.style.height = `${height}px`;
        $photoModalImg.style.width = `${width}px`;
        $photoModalImg.style.transform = 'scale(1)';

        toggleMainTabIndex();
        const transitionDuration = getComputedStyle(document.documentElement).getPropertyValue('--transition-duration');
        setTimeout(() => {
          document.body.removeAttribute('style');
        }, parseFloat(transitionDuration) * 1000);
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
        this.$target.style.top = `${window.scrollY}px`;
        this.$target.style.zIndex = 100;

        const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
        const { src } = $photo.querySelector('.photo__img');
        const $photoModalImg = this.$target.querySelector('.photo-modal__img');
        $photoModalImg.src = src;
        $photoModalImg.removeAttribute('style');
        $photoModalImg.style.transition = `transform var(--transition-duration) var(--transition-timing-function)`;
        this.maximizeImg();
      },
      move: () => {
        const { currentPhoto } = this.state;
        if (!currentPhoto) return;
        const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
        const { src } = $photo.querySelector('.photo__img');
        const $photoModalImg = this.$target.querySelector('.photo-modal__img');

        $photoModalImg.src = src;
        $photoModalImg.removeAttribute('style');
        $photoModalImg.style.opacity = 0.7;
        this.maximizeImg();

        const prevMatrix = getComputedStyle($photoModalImg).transform;
        const getMatrix = () => {
          const splited = prevMatrix.split(', ');
          if (this.prevPhoto.index > currentPhoto.index) splited[4] = parseFloat(splited[4]) - 30;
          else splited[4] = parseFloat(splited[4]) + 30;
          return splited.join(', ');
        };
        $photoModalImg.style.transform = getMatrix();

        setTimeout(() => {
          $photoModalImg.style.transitionProperty = 'transform, opacity';
          $photoModalImg.style.transitionDuration = ' var(--transition-duration)';
          $photoModalImg.style.transitionTimingFunction = 'var(--transition-timing-function)';
          $photoModalImg.style.opacity = 1;
          $photoModalImg.style.transform = prevMatrix;
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
