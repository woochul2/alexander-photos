export class Photos {
  constructor({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement('div');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'photos';
    $app.appendChild(this.$target);
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    this.$target.innerHTML = this.state.map((photo) => `<img src=${photo.filePath} alt=${photo.name}>`).join('');
  }
}
