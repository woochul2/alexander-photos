import { postImages } from '../api.js';

export default class UploadButton {
  constructor({ $app }) {
    this.$target = document.createElement('input');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'upload-button';
    this.$target.type = 'file';
    this.$target.multiple = true;
    $app.appendChild(this.$target);

    this.$target.addEventListener('change', async (event) => {
      const formData = new FormData();
      const files = event.target.files;
      Object.keys(files).forEach((key) => {
        formData.append('photos', files[key]);
      });
      await postImages(formData);
    });
  }
}
