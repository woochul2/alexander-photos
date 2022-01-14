export default class Loading {
  constructor({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement('div');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'loading';
    $app.appendChild(this.$target);
    this.render();
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    if (this.state.isLoading) {
      this.$target.classList.remove('hidden');
      this.$target.innerHTML = `
        <h2 class="loading__text">잠에서 깨어나는 중입니다. 잠시만 기다려주세요!</h2>
        <img class="loading__img" src="https://c.tenor.com/2C5_rB36nqMAAAAi/cute-sleepy.gif" alt="로딩 화면 이미지">
      `;
    } else {
      this.$target.classList.add('hidden');
      this.$target.innerHTML = '';
    }
  }
}
