import { API_ENDPOINT } from '../api.js';

export default class PhotoModals {
  constructor({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement('div');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'photo-modals';
    $app.appendChild(this.$target);

    this.$target.addEventListener('click', (event) => {
      const $photoModal = event.target.closest('.photo-modal');
      if (!$photoModal) return;

      const { id } = $photoModal.dataset;
      const $photo = document.querySelector(`.photo[data-id="${id}"]`);
      const { offsetTop, offsetLeft, clientHeight } = $photo;
      const $photoModalImg = $photoModal.querySelector('.photo-modal__img');
      document.body.style = '';
      $photoModal.classList.remove('visible');
      $photoModal.classList.add('hidden');
      $photoModal.style.zIndex = '';
      $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
      $photoModalImg.style.left = `${offsetLeft}px`;
      $photoModalImg.style.height = `${clientHeight}px`;
      $photoModalImg.style.width = 'auto';
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo) => {
        return `
          <div class="photo-modal hidden" data-id="${photo._id}">
            <img src="${`${API_ENDPOINT}/image/${photo.filePath}`}" class="photo-modal__img">
          </div>
        `;
      })
      .join('');
  }
}
