import API from './api';
import Controller from './core/controller';
import Model from './core/model';
import Template from './core/template';
import View from './core/view';
import './scss/style.scss';

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
    Controller.setTitle(path);

    if (controller.prevPath !== path) {
      window.history.pushState({}, null, path);
      controller.prevPath = path;
    }
  });

  const popstate = () => {
    const { pathname } = window.location;
    controller.popState(pathname);
    Controller.setTitle(pathname);
    controller.prevPath = pathname;
  };

  let popped, setViewCompleted;

  window.addEventListener('popstate', () => {
    popped = true;
    if (setViewCompleted) popstate();
  });

  const { pathname } = window.location;
  Controller.setTitle(pathname);
  controller.prevPath = pathname;
  await controller.setView(pathname);
  setViewCompleted = true;
  if (popped) popstate();
};

main();
