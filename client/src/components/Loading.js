export default class Loading {
  constructor({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement('div');

    this.init($app);
  }

  init($app) {
    this.$target.className = 'loading';
    this.$target.classList.add('hidden');
    this.$target.innerHTML = `
      <h2 class="loading__text">잠에서 깨어나는 중입니다. 잠시만 기다려주세요!</h2>
      <div class="loading__img">
        <div
          class="tenor-gif-embed"
          data-postid="16464084"
          data-share-method="host"
          data-aspect-ratio="1.77778"
          data-width="100%"
        >
          <a href="https://tenor.com/view/cute-sleepy-yawn-tired-cat-gif-16464084">Cute Sleepy Sticker</a>from
          <a href="https://tenor.com/search/cute-stickers">Cute Stickers</a>
        </div>
      </div>
    `;
    setTimeout(() => {
      if (this.state.isLoading) this.$target.classList.remove('hidden');
    }, 500);

    $app.appendChild(this.$target);
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    if (this.state.isLoading) this.$target.classList.remove('hidden');
    else this.$target.classList.add('hidden');
  }
}
