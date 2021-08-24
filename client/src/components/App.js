import { getImages } from '../api.js';
import PhotoModal from './PhotoModal.js';
import Photos from './Photos.js';
import UploadButton from './UploadButton.js';

export default class App {
  constructor($app) {
    this.state = { photos: [], currentIndex: null };

    this.uploadButton = new UploadButton({ $app });
    this.photos = new Photos({
      $app,
      initialState: { photos: this.state.photos },
      onClick: (index) => {
        this.setState({ currentIndex: index });
      },
    });
    this.photoModal = new PhotoModal({
      $app,
      initialState: { currentIndex: this.state.currentIndex },
      onClick: () => {
        this.setState({ currentIndex: null });
      },
    });

    this.init();
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };
    if (nextState.hasOwnProperty('photos')) this.photos.setState({ photos: this.state.photos });
    if (nextState.hasOwnProperty('currentIndex')) this.photoModal.setState({ currentIndex: this.state.currentIndex });
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
