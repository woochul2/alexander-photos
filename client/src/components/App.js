import { getImages } from '../api.js';
import Header from './Header.js';
import Loading from './Loading.js';
import PhotoModals from './PhotoModals.js';
import Photos from './Photos.js';

export default class App {
  constructor($app) {
    this.state = { photos: [], isLoading: true };

    this.header = new Header({ $app, initialState: { isLoading: this.state.Loading } });
    this.loading = new Loading({ $app, initialState: { isLoading: this.state.isLoading } });
    this.photos = new Photos({ $app, initialState: { photos: this.state.photos } });
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
