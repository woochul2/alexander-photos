import { IMG_PATH_PREFIX } from '../api.js';

export default class Photos {
  constructor({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement('div');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'photos';
    $app.appendChild(this.$target);

    this.$target.addEventListener('click', (event) => {
      const $photo = event.target.closest('.photo');
      if (!$photo) return;

      const { id } = $photo.dataset;
      const $photoModal = document.querySelector(`.photo-modal[data-id="${id}"]`);
      document.body.style.overflow = 'hidden';
      $photoModal.classList.remove('hidden');
      $photoModal.classList.add('visible');
      $photoModal.style.top = `${window.scrollY}px`;
      $photoModal.style.zIndex = 100;

      const { offsetTop, offsetLeft, clientWidth, clientHeight } = $photo;
      const $photoModalImg = $photoModal.querySelector('.photo-modal__img');
      $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
      $photoModalImg.style.left = `${offsetLeft}px`;
      $photoModalImg.style.height = `${clientHeight}px`;
      $photoModalImg.style.width = `auto`;

      setTimeout(() => {
        const scaleRatio = window.innerHeight / clientHeight;
        const width = clientWidth * scaleRatio;
        $photoModalImg.style.top = '0';
        $photoModalImg.style.left = `${(window.innerWidth - width) / 2}px`;
        $photoModalImg.style.height = `${window.innerHeight}px`;
      }, 0);
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo) => `<img src=${`${IMG_PATH_PREFIX}/${photo.filePath}`} class="photo" data-id="${photo._id}">`)
      .join('');
  }
}
