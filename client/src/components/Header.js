import { postImage } from '../api.js';
import { getDateTime } from '../utils/getDateTime.js';
import { getExifData } from '../utils/getExifData.js';

export default class Header {
  constructor({ $app, initialState, onUpload }) {
    this.state = initialState;
    this.$target = document.createElement('header');
    this.onUpload = onUpload;

    this.init($app);
  }

  init($app) {
    this.$target.className = 'header';
    $app.appendChild(this.$target);
    this.render();

    const uploadButtonClickEvent = (event) => {
      if (!event.target.closest('.upload-btn')) return;
      const $uploadButtonInput = this.$target.querySelector('.upload-btn-input');
      $uploadButtonInput.click();
    };

    const uploadButtonInputChangeEvent = async (event) => {
      if (!event.target.closest('.upload-btn-input')) return;

      const { files } = event.target;
      const uploadFile = async (key) => {
        const formData = new FormData();
        const file = files[key];
        formData.append('photo', file);
        const exifData = await getExifData(file);
        if (Object.keys(exifData).filter((key) => exifData[key]).length) {
          formData.append('exifData', JSON.stringify(exifData));
        } else {
          const dateTime = getDateTime(file.lastModifiedDate);
          formData.append('exifData', JSON.stringify({ dateTime }));
        }
        await postImage(formData);
        await this.onUpload();
      };
      Object.keys(files).forEach(uploadFile);
    };

    this.$target.addEventListener('click', uploadButtonClickEvent);
    this.$target.addEventListener('change', uploadButtonInputChangeEvent);
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    const uploadButton = `
      <button class="upload-btn" aria-label="이미지 올리기">
        <img src="./src/icons/upload.svg" class="upload-btn-icon" alt="업로드 아이콘"/>
        업로드
      </button>
    `;

    this.$target.innerHTML = `
      <a class="header__title" href="#">알렉산더 포토</a>
      <div class="header__right">
        <a href="https://github.com/woochul2/alexander-photos" class="github-icon" aria-label="깃허브" target="_blank">
          <i class="fab fa-github"></i>
        </a>
        <input type="file" class="upload-btn-input" aria-label="이미지 올리기" multiple hidden>
        ${this.state.isLoading ? '' : uploadButton}
      </div>
    `;
  }
}
