import API from './api';
import Controller from './core/controller';
import Model from './core/model';
import Template from './core/template';
import View from './core/view';
import './scss/style.scss';

const getPath = () => window.location.pathname.slice(1);

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

    const baseTitle = '알렉산더 포토';
    const { title } = a.dataset;
    if (title) document.title = `${baseTitle} - ${title}`;
    else document.title = baseTitle;

    const path = a.getAttribute('href');
    window.history.pushState({}, null, path);
  });

  let popstate;
  let setViewCompleted;

  window.addEventListener('popstate', async () => {
    popstate = true;
    if (setViewCompleted) controller.popState(getPath());
  });

  await controller.setView(getPath());
  setViewCompleted = true;
  if (popstate) controller.popState(getPath());
};

main();
