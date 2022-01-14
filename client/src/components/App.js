import { getPhotos } from '../utils/getPhotos.js';
import { toggleMainTabIndex } from '../utils/toggleMainTabIndex.js';
import Header from './Header.js';
import Loading from './Loading.js';
import PhotoModal from './PhotoModal.js';
import Photos from './Photos.js';

export default class App {
  constructor($app) {
    this.$app = $app;
    this.state = { photos: [], isLoading: true, currentPhoto: null, isModalMoving: false };
    this.onCloseModal = () => {
      this.setState({ currentPhoto: null, isModalMoving: false });
    };
    this.onModalArrowLeft = (index) => {
      if (index === 0) return;
      this.setState({ currentPhoto: this.state.photos[index - 1], isModalMoving: true });
      this.scrollY(index - 1);
    };
    this.onModalArrowRight = (index) => {
      if (index === this.state.photos.length - 1) return;
      this.setState({ currentPhoto: this.state.photos[index + 1], isModalMoving: true });
      this.scrollY(index + 1);
    };

    this.header = new Header({
      $app,
      initialState: { isLoading: this.state.isLoading },
      onUpload: async () => {
        const photos = await getPhotos();
        this.setState({ photos });
      },
    });
    this.loading = new Loading({ $app, initialState: { isLoading: this.state.isLoading } });
    this.photos = new Photos({
      $app,
      initialState: { photos: this.state.photos },
      onClick: (photo) => {
        this.setState({ currentPhoto: photo });
        toggleMainTabIndex();
      },
    });
    this.photoModal = new PhotoModal({
      $app,
      initialState: { currentPhoto: this.state.currentPhoto },
      onClose: this.onCloseModal,
      onArrowLeft: this.onModalArrowLeft,
      onArrowRight: this.onModalArrowRight,
      onDelete: async () => {
        const photos = await getPhotos();
        this.onCloseModal();
        this.setState({ photos });
      },
    });

    this.init();
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };
    const has = (property) => nextState.hasOwnProperty(property);
    if (has('isLoading')) {
      this.header.setState({ isLoading: this.state.isLoading });
      this.loading.setState({ isLoading: this.state.isLoading });
    }
    if (has('photos')) this.photos.setState({ photos: this.state.photos });
    if (has('currentPhoto') || has('isModalMoving')) {
      this.photoModal.setState({ currentPhoto: this.state.currentPhoto, isModalMoving: this.state.isModalMoving });
    }
  }

  async init() {
    try {
      const photos = await getPhotos();
      this.setState({ photos, isLoading: false });
    } catch (err) {
      console.error(err);
    }

    const setAppHeight = () => {
      this.$app.style.height = `${window.innerHeight}px`;
    };

    setAppHeight();

    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        setAppHeight();
      }, 1);
    });

    document.addEventListener('keydown', (event) => {
      const { currentPhoto } = this.state;
      if (!currentPhoto) return;

      if (event.key === 'Escape') {
        const $photoDeleteConfirm = document.querySelector('.photo-delete-confirm');
        if ($photoDeleteConfirm.classList.contains('visible')) {
          $photoDeleteConfirm.classList.remove('visible');
          return;
        }

        const $photo = document.querySelector(`.photo[data-id="${currentPhoto._id}"]`);
        $photo.focus();
        this.onCloseModal();
      } else if (event.key === 'ArrowLeft') {
        this.onModalArrowLeft(currentPhoto.index);
      } else if (event.key === 'ArrowRight') {
        this.onModalArrowRight(currentPhoto.index);
      }
    });
  }

  scrollY(index) {
    const { _id } = this.state.photos[index];
    const $photo = document.querySelector(`.photo[data-id="${_id}"]`);
    const rect = $photo.getBoundingClientRect();
    this.$app.scrollTop += rect.top - this.$app.clientHeight / 2;
  }
}
