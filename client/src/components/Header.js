import { postImage } from '../api.js';
import { getExifData } from '../utils.js';

export default class Header {
  constructor({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement('header');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'header';
    $app.appendChild(this.$target);
    this.render();

    const uploadButtonClickEvent = (event) => {
      const $uploadButton = event.target.closest('.upload-btn');
      if (!$uploadButton) return;

      const $uploadButtonInput = document.querySelector('.upload-btn-input');
      $uploadButtonInput.click();
    };

    const uploadButtonInputChangeEvent = async (event) => {
      const $uploadButtonInput = event.target.closest('.upload-btn-input');
      if (!$uploadButtonInput) return;

      const { files } = event.target;
      Object.keys(files).forEach(async (key) => {
        const formData = new FormData();
        const file = files[key];
        formData.append('photo', file);
        const exifData = await getExifData(file);
        formData.append('exifData', JSON.stringify(exifData));
        await postImage(formData);
      });
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
      <h1 class="header__title">알렉산더 포토</h1>
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
