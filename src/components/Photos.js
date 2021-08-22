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
    // FIXME: 리렌더링 시 이미지가 깜빡여서 이렇게 임시 조치 했는데, 수정이 필요함.
    if (JSON.stringify(this.state) === JSON.stringify(nextState)) return;
    this.state = nextState;
    this.render();
  }

  render() {
    this.$target.innerHTML = this.state.photos
      .map((photo, index) => `<img src=${photo} class="photo" data-index="${index}">`)
      .join('');
  }
}
