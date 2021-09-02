import { API_ENDPOINT } from '../api.js';

export default class Photos {
  constructor({ $app, initialState, onClick }) {
    this.state = initialState;
    this.$target = document.createElement('div');
    this.onClick = onClick;

    this.init($app);
  }

  init($app) {
    this.$target.className = 'photos';
    $app.appendChild(this.$target);
    this.render();

    this.$target.addEventListener('click', (event) => {
      const $photo = event.target.closest('.photo');
      if (!$photo) return;
      const photo = this.state.photos.find((photo) => photo._id === $photo.dataset.id);
      this.onClick(photo);
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo) => {
        const imagePath = encodeURI(`${API_ENDPOINT}/image/${photo.filePath}`);
        return `
          <button class="photo" data-id="${photo._id}" aria-label="사진 열기" onclick="this.blur();">
            <img src=${imagePath} class="photo__img">
          </button>
        `;
      })
      .join('');
  }
}
