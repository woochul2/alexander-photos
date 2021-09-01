import { getImages } from '../api.js';
import { toggleTabIndex } from '../utils/toggleTabIndex.js';
import Header from './Header.js';
import Loading from './Loading.js';
import PhotoModals from './PhotoModals.js';
import Photos from './Photos.js';

export default class App {
  constructor($app) {
    this.state = { photos: [], isLoading: true, currentId: null };

    this.header = new Header({ $app, initialState: { isLoading: this.state.isLoading } });
    this.loading = new Loading({ $app, initialState: { isLoading: this.state.isLoading } });
    this.photos = new Photos({
      $app,
      initialState: { photos: this.state.photos },
      onClick: (id) => {
        this.setState({ currentId: id });
        toggleTabIndex();
      },
    });
    this.photoModals = new PhotoModals({
      $app,
      initialState: { photos: this.state.photos, currentId: this.state.currentId },
      onClose: () => {
        this.setState({ currentId: null });
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
    if (has('photos')) {
      this.photos.setState({ photos: this.state.photos });
      this.photoModals.setState({ photos: this.state.photos });
    }
    if (has('currentId')) this.photoModals.setState({ currentId: this.state.currentId });
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

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.state.currentId !== null) {
        const $photo = document.querySelector(`.photo[data-id="${this.state.currentId}"]`);
        $photo.focus();
        this.setState({ currentId: null });
      }
    });
  }
}
