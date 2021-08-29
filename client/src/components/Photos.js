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
      this.onClick($photo.dataset.id);
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo) => `<img src=${`${API_ENDPOINT}/image/${photo.filePath}`} class="photo" data-id="${photo._id}">`)
      .join('');
  }
}
