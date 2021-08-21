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

  async init() {
    const imagesRef = firebase.storage().ref('images');
    const images = await imagesRef.listAll();

    const photos = [];
    const getImageURL = async (imageRef) => {
      const url = await imageRef.getDownloadURL();
      photos.push(url);
    };

    const promiseList = [];
    images.items.forEach((imageRef) => {
      promiseList.push(getImageURL(imageRef));
    });
    await Promise.all(promiseList);

    this.setState({
      ...this.state,
      photos,
    });
  }
}
