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
    this.state = { ...this.state, ...nextState };
    const has = (property) => nextState.hasOwnProperty(property);
    if (has('photos')) {
      this.render();
    } else if (has('currentId')) {
      this.animation();
    }
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

  animation() {
    const { currentId } = this.state;
    const $photoModal = document.querySelector(`.photo-modal[data-id="${currentId}"]`);
    document.body.style.overflow = 'hidden';
    $photoModal.classList.remove('hidden');
    $photoModal.classList.add('visible');
    $photoModal.style = '';
    $photoModal.style.top = `${window.scrollY}px`;
    $photoModal.style.zIndex = 100;

    const $photo = document.querySelector(`.photo[data-id="${currentId}"]`);
    const { offsetTop, offsetLeft, clientWidth, clientHeight, src } = $photo;
    const $photoModalImg = $photoModal.querySelector('.photo-modal__img');
    $photoModalImg.style = '';
    $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
    $photoModalImg.style.left = `${offsetLeft}px`;
    $photoModalImg.style.height = `${clientHeight}px`;
    $photoModalImg.style.width = `${clientWidth}px`;
    $photoModalImg.src = `${src}?h=${window.innerHeight}`;

    setTimeout(() => {
      const photo = this.state.photos.find((photo) => photo._id === currentId);
      let height = Math.min(window.innerHeight, photo.pixelYDimension);
      let scaleRatio = height / clientHeight;
      let width = clientWidth * scaleRatio;

      if (width > window.innerWidth) {
        width = window.innerWidth;
        scaleRatio = width / clientWidth;
        height = clientHeight * scaleRatio;
      }

      $photoModalImg.style.top = `${(window.innerHeight - height) / 2}px`;
      $photoModalImg.style.left = `${(window.innerWidth - width) / 2}px`;
      $photoModalImg.style.height = `${height}px`;
      $photoModalImg.style.width = `${width}px`;
    }, 0);
  }
}
