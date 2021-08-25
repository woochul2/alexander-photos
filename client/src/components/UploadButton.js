import { postImages } from '../api.js';
import { getExifData } from '../utils.js';

export default class UploadButton {
  constructor({ $app }) {
    this.$target = document.createElement('input');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'upload-button';
    this.$target.type = 'file';
    this.$target.ariaLabel = '이미지 올리기';
    this.$target.multiple = true;
    $app.appendChild(this.$target);

    this.$target.addEventListener('change', async (event) => {
      const formData = new FormData();
      const files = event.target.files;

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
