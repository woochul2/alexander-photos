import { API_ENDPOINT, deleteImage } from '../api.js';
import { getWindowHeight } from '../utils/getWindowHeight.js';
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

  get fileName() {
    const { filePath } = this.state.currentPhoto;
    const { fileName } = filePath.match(/(\d+_)(?<fileName>.*)/).groups;
    return fileName;
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
        $photoModalImg.style.display = 'none';
      },
      download: async () => {
        const { filePath } = this.state.currentPhoto;
        const imagePath = encodeURI(`${API_ENDPOINT}/image/original/${filePath}`);
        const image = await fetch(imagePath);
        const imageBlob = await image.blob();
        const $tmp = document.createElement('a');
        $tmp.href = URL.createObjectURL(imageBlob);
        $tmp.download = this.fileName;
        document.body.appendChild($tmp);
        $tmp.click();
        document.body.removeChild($tmp);
      },
      info: () => {
        const $photoInfoDetail = this.$target.querySelector('.photo-info__detail');
        toggleClass($photoInfoDetail, 'visible');
        const { dateTime, make, model, orientation, pixelXDimension, pixelYDimension } = this.state.currentPhoto;

        const getDateTime = () => {
          const date = new Date(dateTime);
          const dateString = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
          const addPad = (num) => num.toString().padStart(2, '0');
          const timeString = `${addPad(date.getHours())}:${addPad(date.getMinutes())}`;
          return `${dateString} ${timeString}`;
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
          <li><b>이름</b>: ${this.fileName}</li>
          <li><b>생성 날짜</b>: ${getDateTime()}</li>
          <li><b>해상도</b>: ${getPixel()} 화소 (${getPixelDimension()})</li>
          ${make && model ? `<li><b>카메라 모델</b>: ${make} ${model}</li>` : ''}
        `;
      },
    };
  }

  getSrc(photo) {
    const $photo = document.querySelector(`.photo[data-id="${photo._id}"]`);
    const $photoImg = $photo.querySelector('.photo__img');
    const { src } = $photoImg;
    if (src.includes('/src/assets/placeholder.png')) return $photoImg.dataset.src;
    return src;
  }

  getMaxSize(photo) {
    const $photo = document.querySelector(`.photo[data-id="${photo._id}"]`);
    const { width, height } = $photo.getBoundingClientRect();
    const { pixelYDimension } = photo;

    const result = { width: 0, height: 0 };
    result.height = Math.min(getWindowHeight(), pixelYDimension);
    let scaleRatio = result.height / height;
    result.width = width * scaleRatio;

    if (result.width > document.body.clientWidth) {
      result.width = document.body.clientWidth;
      scaleRatio = result.width / width;
      result.height = height * scaleRatio;
    }

    return result;
  }

  minimizeImg(photo) {
    if (!photo) return;
    const $photo = document.querySelector(`.photo[data-id="${photo._id}"]`);
    const $photoModalImg = this.$target.querySelector('.photo-modal__img');
    const { top, left, height, width } = $photo.getBoundingClientRect();

    const src = this.getSrc(photo);
    $photoModalImg.src = src;

    const maxSize = this.getMaxSize(photo);
    $photoModalImg.src = `${src.split('?')[0]}?h=${Math.ceil(maxSize.height * window.devicePixelRatio)}`;
    $photoModalImg.style.top = `${top - (maxSize.height - height) / 2}px`;
    $photoModalImg.style.left = `${left - (maxSize.width - width) / 2}px`;
    $photoModalImg.style.height = `${maxSize.height}px`;
    $photoModalImg.style.transform = `scale(${height / maxSize.height})`;
  }

  maximizeImg() {
    const { currentPhoto } = this.state;
    if (!currentPhoto) return;

    const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
    const $photoModalImg = this.$target.querySelector('.photo-modal__img');
    const { top, left, height, width } = $photo.getBoundingClientRect();

    const translateX = (document.body.clientWidth - width) / 2 - left;
    const translateY = (getWindowHeight() - height) / 2 - top;
    const translate = `translate(${Math.round(translateX)}px, ${Math.round(translateY)}px)`;
    $photoModalImg.style.transform = `${translate} scale(1)`;
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

    const resizeEvent = () => {
      const $photoModalImg = this.$target.querySelector('.photo-modal__img');
      const tmp = $photoModalImg.style.transition;
      $photoModalImg.style.transition = '';
      this.minimizeImg(this.state.currentPhoto);
      this.maximizeImg();
      setTimeout(() => {
        $photoModalImg.style.transition = tmp;
      }, 0);
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
        this.$target.classList.remove('visible');
        this.$target.classList.add('hidden');

        this.minimizeImg(this.prevPhoto);
        toggleMainTabIndex();

        const transitionDuration = getComputedStyle(document.documentElement).getPropertyValue('--transition-duration');
        setTimeout(() => {
          const $photoModalImg = this.$target.querySelector('.photo-modal__img');
          $photoModalImg.removeAttribute('style');
        }, parseFloat(transitionDuration) * 1000);
      },
      expand: () => {
        const { currentPhoto } = this.state;
        if (!currentPhoto) return;
        this.$target.classList.remove('hidden');
        this.$target.classList.add('visible');
        this.$target.style.zIndex = 100;

        this.minimizeImg(currentPhoto);
        setTimeout(() => {
          const $photoModalImg = this.$target.querySelector('.photo-modal__img');
          $photoModalImg.style.transition = 'transform var(--transition-duration) var(--transition-timing-function)';
          this.maximizeImg();
        }, 0);
      },
      move: () => {
        const { currentPhoto } = this.state;
        if (!currentPhoto) return;
        const $photoModalImg = this.$target.querySelector('.photo-modal__img');

        $photoModalImg.removeAttribute('style');
        this.minimizeImg(currentPhoto);
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
