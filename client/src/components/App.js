import { getImages } from '../api.js';
import { toggleTabIndex } from '../utils/toggleTabIndex.js';
import Header from './Header.js';
import Loading from './Loading.js';
import PhotoModal from './PhotoModal.js';
import Photos from './Photos.js';

export default class App {
  constructor($app) {
    this.state = { photos: [], isLoading: true, currentPhoto: null };

    this.header = new Header({ $app, initialState: { isLoading: this.state.isLoading } });
    this.loading = new Loading({ $app, initialState: { isLoading: this.state.isLoading } });
    this.photos = new Photos({
      $app,
      initialState: { photos: this.state.photos },
      onClick: (photo) => {
        this.setState({ currentPhoto: photo });
        toggleTabIndex();
      },
    });
    this.photoModal = new PhotoModal({
      $app,
      initialState: { currentPhoto: this.state.currentPhoto },
      onClose: () => {
        this.setState({ currentPhoto: null });
      },
    });

    this.init();
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };
    const has = (property) => nextState.hasOwnProperty(property);
    if (has('isLoading')) this.header.setState({ isLoading: this.state.isLoading });
    if (has('isLoading')) this.loading.setState({ isLoading: this.state.isLoading });
    if (has('photos')) this.photos.setState({ photos: this.state.photos });
    if (has('currentPhoto')) this.photoModal.setState({ currentPhoto: this.state.currentPhoto });
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
      if (event.key === 'Escape' && this.state.currentPhoto) {
        const $photo = document.querySelector(`.photo[data-id="${this.state.currentPhoto._id}"]`);
        $photo.focus();
        this.setState({ currentPhoto: null });
      }
    });
  }
}
