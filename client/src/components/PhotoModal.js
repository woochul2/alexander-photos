export default class PhotoModal {
  constructor({ $app, initialState, onClick }) {
    this.state = initialState;
    this.$target = document.createElement('div');
    this.onClick = onClick;
    this.prevIndex;

    this.init($app);
  }

  init($app) {
    this.$target.className = 'photo-modal';
    this.$target.classList.add('hidden');
    this.$target.innerHTML = '<img class="photo-modal__img">';
    $app.appendChild(this.$target);

    this.$target.addEventListener('click', () => {
      this.onClick();
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    function setImgStyle($photo) {
      const { offsetTop, offsetLeft, clientHeight } = $photo;
      const $img = document.querySelector('.photo-modal__img');
      $img.style.top = `${offsetTop - window.scrollY}px`;
      $img.style.left = `${offsetLeft}px`;
      $img.style.height = `${clientHeight}px`;
    }

    if (this.state.currentIndex) {
      this.prevIndex = this.state.currentIndex;
      document.body.style.overflow = 'hidden';
      this.$target.classList.remove('hidden');
      this.$target.classList.add('visible');
      this.$target.style.top = `${window.scrollY}px`;

      const $photo = document.querySelector(`.photo[data-index="${this.state.currentIndex}"]`);
      const { src, clientWidth, clientHeight } = $photo;
      const $img = document.querySelector('.photo-modal__img');
      $img.style = '';
      $img.src = src;
      setImgStyle($photo);

      setTimeout(() => {
        const scaleRatio = window.innerHeight / clientHeight;
        const width = clientWidth * scaleRatio;
        $img.style.top = '0';
        $img.style.left = `${(window.innerWidth - width) / 2}px`;
        $img.style.height = `${window.innerHeight}px`;
      }, 0);
    } else {
      if (!this.prevIndex) return;
      document.body.style = '';
      this.$target.classList.remove('visible');
      this.$target.classList.add('hidden');
      const $photo = document.querySelector(`.photo[data-index="${this.prevIndex}"]`);
      setImgStyle($photo);
    }
  }
}
