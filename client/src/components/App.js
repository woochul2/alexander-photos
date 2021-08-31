import { getImages } from '../api.js';
import Header from './Header.js';
import Loading from './Loading.js';
import PhotoModals from './PhotoModals.js';
import Photos from './Photos.js';

export default class App {
  constructor($app) {
    this.state = { photos: [], isLoading: true };

    this.header = new Header({ $app, initialState: { isLoading: this.state.isLoading } });
    this.loading = new Loading({ $app, initialState: { isLoading: this.state.isLoading } });
    this.photos = new Photos({
      $app,
      initialState: { photos: this.state.photos },
      onClick: (id) => {
        const $photoModal = document.querySelector(`.photo-modal[data-id="${id}"]`);
        document.body.style.overflow = 'hidden';
        $photoModal.classList.remove('hidden');
        $photoModal.classList.add('visible');
        $photoModal.style = '';
        $photoModal.style.top = `${window.scrollY}px`;
        $photoModal.style.zIndex = 100;

        const $photo = document.querySelector(`.photo[data-id="${id}"]`);
        const { offsetTop, offsetLeft, clientWidth, clientHeight, src } = $photo;
        const $photoModalImg = $photoModal.querySelector('.photo-modal__img');
        $photoModalImg.style = '';
        $photoModalImg.style.top = `${offsetTop - window.scrollY}px`;
        $photoModalImg.style.left = `${offsetLeft}px`;
        $photoModalImg.style.height = `${clientHeight}px`;
        $photoModalImg.style.width = `auto`;
        $photoModalImg.src = `${src}?h=${window.innerHeight}`;

        setTimeout(() => {
          const scaleRatio = window.innerHeight / clientHeight;
          const width = clientWidth * scaleRatio;
          $photoModalImg.style.top = '0';
          $photoModalImg.style.left = `${(window.innerWidth - width) / 2}px`;
          $photoModalImg.style.height = `${window.innerHeight}px`;
        }, 0);
      },
    });
    this.photoModals = new PhotoModals({ $app, initialState: { photos: this.state.photos } });

    this.init();
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };
    const has = (property) => nextState.hasOwnProperty(property);
    if (has('isLoading')) this.header.setState({ isLoading: this.state.isLoading });
    if (has('isLoading')) this.loading.setState({ isLoading: this.state.isLoading });
    if (has('photos')) this.photos.setState({ photos: this.state.photos });
    if (has('photos')) this.photoModals.setState({ photos: this.state.photos });
  }

  async init() {
    try {
      const images = await getImages();
      const photos = images.results;
      this.setState({
        photos,
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
