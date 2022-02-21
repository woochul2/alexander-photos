/* eslint-disable no-param-reassign */
import { createFocusTrap } from 'focus-trap';
import { KEY, TRANSITION_DURATION } from '../constants';
import addResizeEventListener from '../utils/addResizeEventListener';
import capitalize from '../utils/capitalize';
import getWindowHeight from '../utils/getWindowHeight';
import tooltip from '../utils/tooltip';

export default class View {
  /**
   * @param {HTMLElement} main
   * @param {import('./template').default} template
   */
  constructor(main, template) {
    this.main = main;
    this.template = template;

    this.$headerTitle = document.querySelector('.header__title');
    this.$uploadBtn = document.querySelector('.upload-btn');
    this.$uploadInput = document.querySelector('.upload-input');
    this.$loading = document.querySelector('.loading');
    this.$photos = document.querySelector('.photos');
    this.$photoModal = document.querySelector('.photo-modal');
    this.$dragMessage = document.querySelector('.drag-message');

    this.focusTrap = createFocusTrap(this.$photoModal, { initialFocus: false });

    this.init();
  }

  /**
   * 최초 생성 시 메인 컨테이너의 높이를 설정하고,
   * resize 이벤트가 발생하면 높이를 재설정하도록 이벤트 리스너를 등록한다.
   */
  init() {
    this.setMainHeight();
    addResizeEventListener(this.setMainHeight.bind(this));
  }

  /**
   * 메인 컨테이너의 높이를 주소창을 제외한 화면 높이로 설정한다.
   */
  setMainHeight() {
    this.main.style.height = `${getWindowHeight()}px`;
  }

  /**
   * 사용자 입력을 감지해 입력별로 특정 함수를 실행한다.
   *
   * @param {string} name 사용자 입력 이름
   * @param {function} handler 사용자 입력에 따라 실행할 함수
   */
  watch(name, handler) {
    this[`watch${capitalize(name)}`](handler);
  }

  /**
   * 헤더 제목을 클릭하면 스크롤을 최상단으로 옮긴다.
   */
  watchClickHeader() {
    const headerClickListener = () => {
      this.main.scrollTop = 0;
    };

    this.$headerTitle.addEventListener('click', headerClickListener);
  }

  /**
   * 사진을 업로드 버튼을 클릭하면 input을 클릭하도록 한다.
   * button 태그는 업로드 버튼의 내용을 바꾸기 위해 존재한다.
   */
  watchClickUploadBtn() {
    const uploadBtnClickListener = () => {
      this.$uploadInput.click();
    };

    this.$uploadBtn.addEventListener('click', uploadBtnClickListener);
  }

  /**
   * 사진 파일들을 핸들러에 넘겨준다.
   *
   * @param {function} handler 사진 파일들을 받아 업로드하고, 모든 사진을 리렌더링하는 함수
   */
  watchUpload(handler) {
    const uploadListener = (event) => {
      handler(event.target.files);

      event.target.value = '';
    };

    this.$uploadInput.addEventListener('change', uploadListener);
  }

  /**
   * 사진을 클릭하면 핸들러에 index를 넘겨준다.
   *
   * @param {function} handler 사진의 index를 받아 모달을 띄우는 함수
   */
  watchClickPhoto(handler) {
    const photoClickListener = (event) => {
      const photo = event.target.closest('.photo');
      if (!photo) return;

      handler(Number(photo.dataset.index));
    };

    this.$photos.addEventListener('click', photoClickListener);
  }

  /**
   * 닫기 버튼을 클릭하거나 ESC 키를 누르면 핸들러에 index를 넘겨준다.
   *
   * @param {function} handler 사진의 index를 받아 모달을 닫는 함수
   */
  watchCloseModal(handler) {
    const photoModalCloseClickListener = (event) => {
      if (event.target.closest('.photo-modal__close-btn')) {
        handler(Number(this.$photoModal.dataset.index));
      }
    };

    const photoModalCloseKeydownListener = (event) => {
      if (!this.$photoModal.classList.contains('visible')) {
        return;
      }

      if (event.key === KEY.esc) {
        const a = this.$photoModal.querySelector('.photo-modal__close-btn');
        a.click();
      }
    };

    this.$photoModal.addEventListener('click', photoModalCloseClickListener);
    window.addEventListener('keydown', photoModalCloseKeydownListener);
  }

  /**
   * 이전 또는 다음 버튼을 클릭하면 핸들러에 변경할 index를 넘겨준다.
   *
   * @param {function} handler 사진의 index를 받아 모달의 사진을 바꾸는 함수
   */
  watchMoveModal(handler) {
    const move = (callback) => {
      const { index } = this.$photoModal.dataset;
      const nextIndex = callback(Number(index));
      handler(nextIndex);
    };

    const photoModalMoveClickListener = (event) => {
      const moveBtn = event.target.closest('.photo-modal__move');
      if (!moveBtn) return;

      if (!event.target.closest('.photo-modal__arrow-btn')) {
        const a = moveBtn.querySelector('a');
        a.click();
        return;
      }

      if (moveBtn.classList.contains('left')) {
        move((index) => index - 1);
      } else if (moveBtn.classList.contains('right')) {
        move((index) => index + 1);
      }
    };

    const keyMap = new Map();
    const photoModalMoveKeydownListener = (event) => {
      keyMap.set(event.key, true);

      if (this.$photoModal.classList.contains('hidden')) {
        return;
      }

      const { alt, ctrl, shift } = KEY;
      if (keyMap.get(alt) || keyMap.get(ctrl) || keyMap.get(shift)) {
        return;
      }

      const click = (selector) => {
        const a = this.$photoModal.querySelector(selector);
        if (a) a.click();
      };

      if (event.key === KEY.arrowLeft) {
        click('.photo-modal__move.left > a');
      } else if (event.key === KEY.arrowRight) {
        click('.photo-modal__move.right > a');
      }
    };

    const keyUpListener = (event) => {
      keyMap.delete(event.key);
    };

    this.$photoModal.addEventListener('click', photoModalMoveClickListener);
    window.addEventListener('keydown', photoModalMoveKeydownListener);
    window.addEventListener('keyup', keyUpListener);
  }

  /**
   * 사진 정보 버튼을 클릭하면 핸들러에 사진의 index를 넘겨준다.
   *
   * @param {function} handler 사진의 index를 받아 사진 정보 창을 토글하는 함수
   */
  watchClickInfoBtn(handler) {
    const infoClickListener = (event) => {
      if (event.target.closest('.photo-info__btn')) {
        handler(Number(this.$photoModal.dataset.index));
      }
    };

    this.$photoModal.addEventListener('click', infoClickListener);
  }

  /**
   * 다운로드 버튼을 클릭하면 핸들러에 사진 index를 넘겨준다.
   *
   * @param {function} handler 사진 index를 받아 원본을 다운로드하는 함수
   */
  watchDownload(handler) {
    const downloadListener = (event) => {
      if (!event.target.closest('.photo-modal__download-btn')) {
        return;
      }

      handler(Number(this.$photoModal.dataset.index));
    };

    this.$photoModal.addEventListener('click', downloadListener);
  }

  /**
   * 사진 삭제 버튼 클릭을 감지한다.
   *
   * @param {function} handler 사진 삭제 확인 창을 토글하는 함수
   */
  watchClickDeleteBtn(handler) {
    const clickDeleteBtnListener = (event) => {
      if (event.target.closest('.photo-delete__btn')) {
        handler();
      }
    };

    this.$photoModal.addEventListener('click', clickDeleteBtnListener);
  }

  /**
   * 사진 삭제를 취소한다.
   *
   * @param {function} handler 사진 삭제 확인 창을 닫는 함수
   */
  watchCancelDelete(handler) {
    const clickCancelBtnListener = (event) => {
      if (event.target.closest('.cancel-btn')) {
        handler();
      }
    };

    this.$photoModal.addEventListener('click', clickCancelBtnListener);
  }

  /**
   * 사진을 삭제한다.
   *
   * @param {function} handler 사진의 index를 받아 사진을 삭제하는 함수
   */
  watchConfirmDelete(handler) {
    const clickConfirmBtnListener = (event) => {
      if (event.target.closest('.confirm-btn')) {
        handler(Number(this.$photoModal.dataset.index));
      }
    };

    this.$photoModal.addEventListener('click', clickConfirmBtnListener);
  }

  /**
   * 사진 파일들을 드래그해서 가져오면 handler를 실행한다.
   *
   * @param {function} handler 드래그 메시지를 출력하는 함수
   */
  watchDragEnter(handler) {
    const dragEnterListener = (event) => {
      if (this.$photoModal.classList.contains('visible')) {
        return;
      }

      const files = [...event.dataTransfer.items].filter((item) => {
        return item.kind === 'file';
      });
      if (!files.length) return;

      handler();
    };

    this.main.addEventListener('dragenter', dragEnterListener);
  }

  /**
   * 드래그해온 사진 파일들을 내보내면 handler를 실행한다.
   *
   * @param {function} handler 드래그 메시지를 숨기는 함수
   */
  watchDragLeave(handler) {
    const dragLeaveListener = () => {
      handler();
    };

    this.$dragMessage.addEventListener('dragleave', dragLeaveListener);
  }

  /**
   * 사진 파일들을 핸들러에 넘겨준다.
   *
   * @param {function} handler 드래그 메시지를 숨기고 파일을 업로드하는 함수
   */
  watchDrop(handler) {
    const dropListener = (event) => {
      event.preventDefault();
      handler(event.dataTransfer.files);
    };

    this.$dragMessage.addEventListener('drop', dropListener);
    this.$dragMessage.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
  }

  /**
   * 명령어에 해당하는 DOM 엘리먼트를 업데이트한다.
   *
   * @param {string} command 명령어 이름
   * @param {*} parameter DOM 엘리먼트를 업데이트하는 데 필요한 변수
   */
  render(command, parameter) {
    this[`render${capitalize(command)}`](parameter);
  }

  /**
   * 로딩 메시지를 출력한다.
   */
  renderLoadingStart() {
    this.$loading.innerHTML = this.template.loadingMessage;
  }

  /**
   * 로딩 메시지를 삭제하고, 업로드 버튼을 출력한다.
   */
  renderLoadingCompleted() {
    this.$loading.remove();
    this.$uploadBtn.innerHTML = this.template.uploadBtn;
    this.$uploadBtn.classList.remove('hidden');
  }

  /**
   * 로딩 에러를 출력한다.
   */
  renderLoadingFailed() {
    this.$loading.innerHTML = this.template.loadingError;
  }

  /**
   * 모든 사진을 출력하고, 사진 컨테이너의 높이 스타일을 설정한다.
   * 각 사진에는 lazy loading 이벤트를 등록한다.
   *
   * @param {Object} param
   * @param {Photo[]} param.photos
   * @param {string} param.endpoint
   */
  renderPhotos({ photos, endpoint }) {
    this.$photos.innerHTML = this.template.photos(photos, endpoint);
    this.$photos.style.height = `${this.template.geometry.containerHeight}px`;

    const options = { root: this.main, rootMargin: '300px 0px' };
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.addEventListener('load', () => {
            image.style.width = '';
          });
          imageObserver.unobserve(image);
        }
      });
    }, options);

    const images = this.$photos.querySelectorAll('.photo__img');
    images.forEach((img) => {
      imageObserver.observe(img);
    });
  }

  /**
   * 사진이 화면을 꽉 채우는 최대 크기를 구한다.
   *
   * @param {Photo} photo
   * @param {number} index
   */
  getPhotoMaxSize(photo, index) {
    const { height: originalHeight } = photo;
    const { width, height } = this.template.geometry.boxes[index];

    const maxHeight = Math.min(getWindowHeight(), originalHeight);

    const result = { width: 0, height: 0 };
    result.height = maxHeight;
    result.width = width * (result.height / height);

    const rootWidth = document.documentElement.clientWidth;
    if (result.width > rootWidth) {
      result.width = rootWidth;
      result.height = height * (result.width / width);
    }

    return result;
  }

  /**
   * 원래 사진의 top 위치에 컨테이너의 오프셋, 스크롤 위치를 더해 반환한다.
   *
   * @param {number} index
   */
  getPhotoTop(index) {
    const { top } = this.template.geometry.boxes[index];
    return top + this.$photos.offsetTop - this.main.scrollTop;
  }

  /**
   * 모달의 이미지를 원래 사진의 위치 및 크기에 맞춘다.
   *
   * @param {Photo} photo
   * @param {number} index
   * @param {HTMLElement} img
   */
  matchModalImg(photo, index, img) {
    const maxSize = this.getPhotoMaxSize(photo, index);
    const { left, width, height } = this.template.geometry.boxes[index];
    const top = this.getPhotoTop(index);

    const h = Math.ceil(maxSize.height * window.devicePixelRatio);
    img.src = `${img.src.split('?')[0]}?h=${h}`;
    img.style.top = `${top - (maxSize.height - height) / 2}px`;
    img.style.left = `${left - (maxSize.width - width) / 2}px`;
    img.style.height = `${maxSize.height}px`;
    img.style.transition = 'none';
    img.style.transform = `scale(${height / maxSize.height})`;
  }

  /**
   * 모달의 이미지를 화면 중앙에 꽉 차도록 옮긴다.
   *
   * @param {number} index
   * @param {HTMLElement} img
   */
  centerModalImg(index, img) {
    const { left, width, height } = this.template.geometry.boxes[index];
    const top = this.getPhotoTop(index);
    const rootWidth = document.documentElement.clientWidth;
    const x = Math.round((rootWidth - width) / 2 - left);
    const y = Math.round((getWindowHeight() - height) / 2 - top);
    const translate = `translate(${x}px, ${y}px)`;

    img.style.transform = `${translate} scale(1)`;
  }

  /**
   * 모달의 data 속성에 index를 설정한다.
   *
   * @param {number} index
   */
  setModalIndex(index) {
    this.$photoModal.dataset.index = index;
  }

  /**
   * 모달을 띄운다. index 매개변수가 없으면 애니메이션을 실행하지 않는다.
   *
   * @param {Object} param
   * @param {Photo} param.photo
   * @param {number | undefined} param.index
   * @param {string} param.endpoint
   */
  renderOpenModal(param) {
    clearTimeout(this.closeModalTimeoutID);

    this.$photoModal.innerHTML = this.template.photoModal(param);
    const { photo, index } = param;

    this.$photoModal.classList.remove('hidden');
    this.$photoModal.classList.add('visible');
    this.focusTrap.activate();
    this.setModalIndex(index);

    window.requestAnimationFrame(() => {
      if (index === undefined) {
        this.$photoModal.style.transition = 'none';

        window.requestAnimationFrame(() => {
          this.$photoModal.style.transition = '';
        });
      } else {
        const img = this.$photoModal.querySelector('.photo-modal__img');
        this.matchModalImg(photo, index, img);

        window.requestAnimationFrame(() => {
          img.style.transition = '';
          this.centerModalImg(index, img);
        });
      }
    });

    const top = this.$photoModal.querySelector('.photo-modal__top');
    const infoBtn = top.querySelector('.photo-info__btn');
    const downloadBtn = top.querySelector('.photo-modal__download-btn');
    const deleteBtn = top.querySelector('.photo-delete__btn');
    tooltip.add(infoBtn, '정보');
    tooltip.add(downloadBtn, '원본 다운로드');
    tooltip.add(deleteBtn, '삭제');
  }

  /**
   * 이전, 다음 버튼을 출력한다.
   *
   * @param {Object} param
   * @param {Photo | undefined} param.prevPhoto
   * @param {Photo | undefined} param.nextPhoto
   */
  renderModalMoveBtn({ prevPhoto, nextPhoto }) {
    const move = this.$photoModal.querySelector('.photo-modal-move-container');
    move.innerHTML = this.template.modalMoveBtn(prevPhoto, nextPhoto);
  }

  /**
   * 모달을 닫는다. 매개변수 자체가 없거나 매개변수의
   * index 속성이 NaN이면 줄어드는 애니메이션을 실행하지 않는다.
   *
   * @param {Object} param
   * @param {Photo} param.photo
   * @param {number} param.index
   */
  renderCloseModal(param) {
    this.focusTrap.deactivate();
    this.$photoModal.classList.remove('visible');
    this.$photoModal.classList.add('hidden');

    if (!param || Number.isNaN(param.index)) {
      this.$photoModal.innerHTML = '';
      return;
    }

    const { photo, index } = param;
    const { height } = this.template.geometry.boxes[index];
    const img = this.$photoModal.querySelector('.photo-modal__img');
    const maxSize = this.getPhotoMaxSize(photo, index);
    img.style.transition = '';
    img.style.transform = `scale(${height / maxSize.height})`;

    this.closeModalTimeoutID = setTimeout(() => {
      this.$photoModal.innerHTML = '';
      this.$photos.querySelector(`.photo[data-index="${index}"]`).focus();
    }, TRANSITION_DURATION * 1000);
  }

  /**
   * index에 해당하는 사진이 중앙에 위치하도록 메인 컨테이너의 스크롤 위치를 바꾼다.
   *
   * @param {number} index
   */
  scrollMain(index) {
    const top = this.getPhotoTop(index);
    const { height } = this.template.geometry.boxes[index];
    this.main.scrollTop += top - (this.main.clientHeight - height) / 2;
  }

  /**
   * 모달의 사진을 이전 또는 다음 인덱스의 사진으로 바꾼다.
   *
   * @param {Object} param
   * @param {Photo} param.photo
   * @param {number} param.index
   * @param {string} param.endpoint
   */
  renderMoveModal({ photo, index, endpoint }) {
    this.scrollMain(index);
    this.setModalIndex(index);

    const img = this.$photoModal.querySelector('.photo-modal__img');
    img.src = '';
    img.src = this.template.getImagePath(photo, index, endpoint);

    this.matchModalImg(photo, index, img);
    const imgStyle = window.getComputedStyle(img);
    this.centerModalImg(index, img);

    const prevMatrix = imgStyle.transform;

    const nextMatrix = () => {
      const splited = prevMatrix.split(', ');
      const prevIndex = Number(this.$photoModal.dataset.index);
      if (prevIndex > index) {
        splited[4] = Number(splited[4]) - 30;
      } else {
        splited[4] = Number(splited[4]) + 30;
      }
      return splited.join(', ');
    };

    window.requestAnimationFrame(() => {
      img.style.opacity = 0.7;
      img.style.transform = nextMatrix();

      window.requestAnimationFrame(() => {
        img.style.transition = '';
        img.style.transitionProperty = 'transform, opacity';
        img.style.opacity = 1;
        img.style.transform = prevMatrix;
      });
    });
  }

  /**
   * 모달의 사진 크기를 화면에 맞춘다.
   *
   * @param {Object} param
   * @param {Photo} param.photo
   * @param {number} index
   */
  renderResizeModal({ photo, index }) {
    if (this.$photoModal.classList.contains('hidden')) {
      return;
    }

    const img = this.$photoModal.querySelector('.photo-modal__img');
    this.matchModalImg(photo, index, img);
    this.centerModalImg(index, img);
  }

  /**
   * 사진 정보 창을 연다.
   *
   * @param {Photo} photo
   */
  renderOpenInfo(photo) {
    const detail = this.$photoModal.querySelector('.photo-info__detail');
    detail.innerHTML = this.template.info(photo);
    detail.classList.add('visible');
  }

  /**
   * 사진 정보 창을 닫는다.
   */
  renderCloseInfo() {
    const detail = this.$photoModal.querySelector('.photo-info__detail');
    detail.innerHTML = '';
    detail.classList.remove('visible');
  }

  /**
   * 사진 정보 창을 토글한다.
   *
   * @param {Photo} photo
   */
  renderToggleInfo(photo) {
    const detail = this.$photoModal.querySelector('.photo-info__detail');

    if (detail.classList.contains('visible')) {
      this.renderCloseInfo();
    } else {
      this.renderOpenInfo(photo);
    }
  }

  /**
   * 사진 삭제 확인 창을 토글한다.
   */
  renderToggleDeleteConfirm() {
    const confirm = this.$photoModal.querySelector('.photo-delete-confirm');

    if (confirm.classList.contains('visible')) {
      confirm.innerHTML = '';
      confirm.classList.remove('visible');
    } else {
      confirm.innerHTML = this.template.deleteConfirm;
      confirm.classList.add('visible');
    }
  }

  /**
   * 사진 삭제 확인 창을 닫는다.
   */
  renderCancelDelete() {
    const confirm = this.$photoModal.querySelector('.photo-delete-confirm');
    confirm.innerHTML = '';
    confirm.classList.remove('visible');
  }

  /**
   * 드래그 메시지를 출력한다.
   */
  renderDragEnter() {
    window.requestAnimationFrame(() => {
      this.$dragMessage.classList.remove('hidden');

      window.requestAnimationFrame(() => {
        this.$dragMessage.classList.add('visible');
      });
    });
  }

  /**
   * 드래그 메시지를 숨긴다.
   */
  renderDragLeave() {
    this.$dragMessage.classList.remove('visible');
    this.$dragMessage.classList.add('hidden');
  }
}
