import API from './api';
import Controller from './core/controller';
import Model from './core/model';
import Template from './core/template';
import View from './core/view';
import './scss/style.scss';

const main = async () => {
  const api = new API();
  const model = new Model(api);
  const template = new Template();
  const view = new View(document.querySelector('.main'), template);
  const controller = new Controller(model, view);

  await controller.setView();
};

main();
