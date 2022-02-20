import API from './api';
import Controller from './core/controller';
import Model from './core/model';
import Template from './core/template';
import View from './core/view';
import './scss/style.scss';

const getPath = () => window.location.pathname.slice(1);

const setTitle = (path) => {
  const baseTitle = '알렉산더 포토';
  if (path) document.title = `${baseTitle} - 사진`;
  else document.title = baseTitle;
};

const main = async () => {
  const root = document.querySelector('.main');

  const api = new API();
  const model = new Model(api);
  const template = new Template();
  const view = new View(root, template);
  const controller = new Controller(model, view);

  root.addEventListener('click', (event) => {
    const a = event.target.closest('a');
    if (!a || !a.classList.contains('spa-link')) {
      return;
    }

    event.preventDefault();

    const path = a.getAttribute('href');
    setTitle(path.slice(1));

    window.history.pushState({}, null, path);
  });

  let popped;
  let setViewCompleted;

  const popstate = () => {
    const path = getPath();
    controller.popState(path);
    setTitle(path);
  };

  window.addEventListener('popstate', async () => {
    popped = true;
    if (setViewCompleted) popstate();
  });

  setTitle(getPath());
  await controller.setView(getPath());
  setViewCompleted = true;
  if (popped) popstate();
};

main();
