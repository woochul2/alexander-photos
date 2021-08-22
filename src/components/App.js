import Photos from './Photos.js';
import PhotoModal from './PhotoModal.js';

export default class App {
  constructor($app) {
    this.state = { photos: [], currentIndex: null };

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
    this.setState({
      photos: Array(10).fill(
        'https://images.unsplash.com/photo-1593642532400-2682810df593?ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      ),
    });
  }
}
