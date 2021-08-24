const IMG_PATH_PREFIX = 'https://alexander-photos-images.s3.ap-northeast-2.amazonaws.com';

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

    this.$target.addEventListener('click', (event) => {
      const $photo = event.target.closest('.photo');
      if (!$photo) return;
      const { index } = $photo.dataset;
      this.onClick(index);
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo, index) => `<img src=${`${IMG_PATH_PREFIX}/${photo.filePath}`} class="photo" data-index="${index}">`)
      .join('');
  }
}
