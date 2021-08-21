import { App } from './components/App.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAXlqiFIPxD_Ea6Edp4NGQ4qKMrwwj7pDI',
  authDomain: 'alexander-photos.firebaseapp.com',
  projectId: 'alexander-photos',
  storageBucket: 'alexander-photos.appspot.com',
  messagingSenderId: '999844733675',
  appId: '1:999844733675:web:92e94b285b715f35a794ae',
};

firebase.initializeApp(firebaseConfig);

new App(document.querySelector('#app'));
