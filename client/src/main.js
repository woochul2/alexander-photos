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
  const view = new View(document.querySelector('.main'), template);
  const controller = new Controller(model, view);

  const { pathname } = window.location;
  await controller.setView(pathname.slice(1));

  const spaLinkClickListener = (event) => {
    const a = event.target.closest('a');
    if (!a || !a.classList.contains('spa-link')) return;

    event.preventDefault();
    const path = a.getAttribute('href');
    window.history.pushState({}, null, path);
  };

  root.addEventListener('click', spaLinkClickListener);
};

main();
