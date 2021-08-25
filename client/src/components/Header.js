import { postImages } from '../api.js';
import { getExifData } from '../utils.js';

export default class Header {
  constructor({ $app }) {
    this.$target = document.createElement('header');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'header';
    this.$target.innerHTML = `
      <h1 class="header__title">알렉산더 포토</h1>
      <input class="upload-button-input" type="file" aria-label="이미지 올리기" multiple hidden>
      <button class="upload-button" aria-label="이미지 올리기">
        <img class="upload-button-icon" src="./src/icons/upload.svg" />
        업로드
      </button>
    `;
    $app.appendChild(this.$target);

    const $uploadButton = document.querySelector('.upload-button');
    const $uploadButtonInput = document.querySelector('.upload-button-input');

    $uploadButton.addEventListener('click', () => {
      $uploadButtonInput.click();
    });

    $uploadButtonInput.addEventListener('change', async (event) => {
      const { files } = event.target;
      const formData = new FormData();

      const promiseFuncs = [];
      const appendFormData = async (file) => {
        const exifData = await getExifData(file);
        formData.append('photos', file);
        formData.append('exifDatas', JSON.stringify(exifData));
      };

      Object.keys(files).forEach((key) => {
        promiseFuncs.push(appendFormData(files[key]));
      });

      await Promise.all(promiseFuncs);
      await postImages(formData);
    });
  }
}
