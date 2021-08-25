import { getImages } from '../api.js';
import Header from './Header.js';
import PhotoModals from './PhotoModals.js';
import Photos from './Photos.js';

export default class App {
  constructor($app) {
    this.state = { photos: [] };

    this.Header = new Header({ $app });
    this.photos = new Photos({
      $app,
      initialState: { photos: this.state.photos },
    });
    this.photoModals = new PhotoModals({
      $app,
      initialState: { photos: this.state.photos },
    });

    this.init();
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };

    const has = (property) => nextState.hasOwnProperty(property);
    if (has('photos')) this.photos.setState({ photos: this.state.photos });
    if (has('photos')) this.photoModals.setState({ photos: this.state.photos });
  }

  async init() {
    try {
      const images = await getImages();
      const photos = images.results;
      this.setState({
        photos,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
