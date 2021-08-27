import { postImages } from '../api.js';
import { getExifData } from '../utils.js';

export default class Header {
  constructor({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement('header');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'header';
    this.$target.innerHTML = `
      <h1 class="header__title">알렉산더 포토</h1>
      <div class="header__right">
        <a class="github-icon" href="https://github.com/woochul2/alexander-photos" aria-label="깃허브" target="_blank">
          <i class="fab fa-github"></i>
        </a>
        <input class="upload-button-input" type="file" aria-label="이미지 올리기" multiple hidden>
        <button class="upload-button hidden" aria-label="이미지 올리기">
          <img class="upload-button-icon" src="./src/icons/upload.svg" alt="업로드 아이콘"/>
          업로드
        </button>
      </div>
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

      const appendFormData = async (file) => {
        const exifData = await getExifData(file);
        formData.append('photos', file);
        formData.append('exifDatas', JSON.stringify(exifData));
      };

      await Promise.all(
        Object.keys(files).reduce((prevList, key) => {
          return [...prevList, appendFormData(files[key])];
        }, [])
      );
      await postImages(formData);
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    const $uploadButton = document.querySelector('.upload-button');
    if (this.state.isLoading) $uploadButton.classList.add('hidden');
    else $uploadButton.classList.remove('hidden');
  }
}
