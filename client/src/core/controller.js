import addResizeEventListener from '../utils/addResizeEventListener';
import downloadImage from '../utils/downloadImage';

export default class Controller {
  /**
   * @param {import('./model').default} model
   * @param {import('./view').default} view
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.init();
  }

  /**
   * 사진을 리렌더링한다.
   */
  reRenderPhotos() {
    if (!this.photos) return;

    this.view.render('photos', {
      photos: this.photos,
      endpoint: this.model.api.ENDPOINT,
    });
  }

  /**
   * 모달 사진 크기를 화면에 맞춘다.
   */
  resizeModal() {
    if (!this.photos) return;
    if (this.currentIndex === undefined) return;

    const photo = this.photos[this.currentIndex];
    this.view.render('resizeModal', photo);
  }

  /**
   * 최초 생성 시 한 번만 실행한다.
   * - 사용자 입력에 따라 어떤 함수를 실행할지 설정한다.
   * - resize 이벤트 리스너를 등록한다.
   */
  init() {
    this.view.watch('clickUploadBtn');
    this.view.watch('upload', this.upload.bind(this));
    this.view.watch('clickPhoto', this.openModal.bind(this));
    this.view.watch('closeModal', this.closeModal.bind(this));
    this.view.watch('moveModal', this.moveModal.bind(this));
    this.view.watch('clickInfoBtn', this.toggleInfo.bind(this));
    this.view.watch('download', this.download.bind(this));
    this.view.watch('clickDeleteBtn', this.toggleDeleteConfirm.bind(this));
    this.view.watch('cancelDelete', this.cancelDelete.bind(this));
    this.view.watch('confirmDelete', this.confirmDelete.bind(this));

    addResizeEventListener(() => {
      this.reRenderPhotos();
      this.resizeModal();
    });
  }

  /**
   * 데이터를 정상적으로 불러온 후에 로딩 메시지를 삭제하고, 모든 사진을 출력한다.
   * 데이터를 불러오지 못했다면, 로딩 에러 메시지를 출력한다.
   */
  async setView() {
    let loadingDone = false;

    try {
      setTimeout(() => {
        if (!loadingDone) this.view.render('loadingStart');
      }, 300);

      this.photos = await this.model.readPhotos();
      loadingDone = true;

      this.view.render('loadingCompleted');
      this.view.render('photos', {
        photos: this.photos,
        endpoint: this.model.api.ENDPOINT,
      });
    } catch (error) {
      console.error(error);
      loadingDone = true;
      this.view.render('loadingFailed');
    }
  }

  /**
   * 모달을 띄운다. 저장해둔 사진의 정보를 사용한다.
   *
   * @param {number} index
   */
  openModal(index) {
    const photo = this.photos[index];
    this.currentIndex = index;
    this.view.render('openModal', {
      photo,
      endpoint: this.model.api.ENDPOINT,
    });
  }

  /**
   * 모든 사진을 정상적으로 업로드한 후,
   * 모델에서 사진의 정보를 새로 받아 모든 사진을 리렌더링한다.
   *
   * @param {FileList} files
   */
  upload(files) {
    this.model.upload(files).then(async () => {
      this.photos = await this.model.readPhotos();
      this.view.render('photos', {
        photos: this.photos,
        endpoint: this.model.api.ENDPOINT,
      });
    });
  }

  /**
   * 모달을 닫는다. 저장해둔 사진의 정보를 사용한다.
   * 정보 창과 삭제 확인 창도 닫는다.
   *
   * @param {number} index
   */
  closeModal(index) {
    const photo = this.photos[index];
    this.view.render('closeModal', photo);
    this.view.render('closeInfo');
    this.isInfoOpen = false;
    this.cancelDelete();
  }

  /**
   * 모달의 사진을 이전 또는 다음 인덱스의 사진으로 바꾼다.
   * 저장해둔 사진의 정보를 사용한다.
   *
   * @param {number} index
   */
  moveModal(index) {
    if (index < 0 || index >= this.photos.length) {
      return;
    }

    const photo = this.photos[index];
    this.currentIndex = index;
    this.view.render('moveModal', {
      photo,
      endpoint: this.model.api.ENDPOINT,
    });
    this.cancelDelete();

    if (this.isInfoOpen) {
      this.view.render('openInfo', photo);
    }
  }

  /**
   * 사진 정보 창을 토글한다.
   *
   * @param {number} index
   */
  toggleInfo(index) {
    const photo = this.photos[index];
    this.view.render('toggleInfo', photo);
    this.isInfoOpen = !this.isInfoOpen;
  }

  /**
   * 사진 원본을 다운로드한다.
   *
   * @param {number} index
   */
  download(index) {
    const { filePath } = this.photos[index];
    const url = `${this.model.api.ENDPOINT}/image/original/${filePath}`;
    const { fileName } = filePath.match(/(\d+_)(?<fileName>.*)/).groups;
    downloadImage(url, fileName);
  }

  /**
   * 사진 삭제 확인 창을 토글한다.
   */
  toggleDeleteConfirm() {
    this.view.render('toggleDeleteConfirm');
  }

  /**
   * 사진 삭제 확인 창을 닫는다.
   */
  cancelDelete() {
    this.view.render('cancelDelete');
  }

  /**
   * 사진을 삭제하고 모델에서 사진의 정보를 새로 받아 모든 사진을 리렌더링한다.
   *
   * @param {number} index
   */
  confirmDelete(index) {
    const { filePath } = this.photos[index];
    this.model.deletePhoto(filePath).then(async () => {
      this.photos = await this.model.readPhotos();
      this.view.render('closeModal');
      this.view.render('photos', {
        photos: this.photos,
        endpoint: this.model.api.ENDPOINT,
      });
    });
  }
}
