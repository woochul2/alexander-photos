import { Photos } from './Photos.js';

export class App {
  constructor($app) {
    this.state = { photos: [] };
    this.photos = new Photos({ $app, initialState: this.state.photos });

    this.init();
  }

  setState(nextState) {
    this.state = nextState;
    this.photos.setState(this.state.photos);
  }

  init() {
    this.setState({
      ...this.state,
      photos: [
        { filePath: 'https://source.unsplash.com/random?1', name: '1' },
        { filePath: 'https://source.unsplash.com/random?2', name: '2' },
      ],
    });
  }
}
