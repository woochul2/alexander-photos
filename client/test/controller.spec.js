/* eslint-disable one-var, one-var-declaration-per-line */
import placeholder from '../assets/placeholder.png';
import API from '../src/api';
import Controller from '../src/core/controller';
import Model from '../src/core/model';

describe('controller', () => {
  let api, model, view, controller, images, photos;

  const createViewStub = () => {
    const eventRegistry = {};

    return {
      watch(event, handler) {
        eventRegistry[event] = handler;
      },
      trigger(event, ...rest) {
        eventRegistry[event](...rest);
      },
      async triggerAsync(event, ...rest) {
        await eventRegistry[event](...rest);
      },
      render: jasmine.createSpy('render'),
      setModalIndex: jasmine.createSpy('setModalIndex'),
      scrollMain: jasmine.createSpy('scrollMain'),
    };
  };

  const setUpModelMethods = (methods) => {
    methods.forEach((name) => {
      spyOn(model, name);
      model[name].and.callThrough();
    });
  };

  beforeAll(() => {
    Controller.redirectTo = jasmine.createSpy();
  });

  beforeEach(async () => {
    api = new API();
    model = new Model(api);
    view = createViewStub();
    controller = new Controller(model, view);

    setUpModelMethods(['readPhotos', 'readPhoto', 'upload', 'deletePhoto']);

    images = await api.getImages();
    photos = images.map(Model.imageToPhoto);
  });

  describe('setView', () => {
    it('기본', async () => {
      await controller.setView();

      expect(model.readPhotos).toHaveBeenCalled();
      expect(controller.photos).toEqual(photos);
      expect(view.render).toHaveBeenCalledWith('loadingCompleted');
      expect(view.render).toHaveBeenCalledWith('photos', {
        photos,
        endpoint: api.ENDPOINT,
      });
    });

    it('서버 에러', async () => {
      model.api.ENDPOINT = 'something strange endpoint';
      await controller.setView();

      expect(model.readPhotos).toHaveBeenCalled();

      expect(view.render).toHaveBeenCalledWith('loadingFailed');
    });

    it('path 지정', async () => {
      const id = images[0]._id;
      await controller.setView(id);
      const index = photos.findIndex(({ _id }) => _id === id);
      const photo = photos[index];

      expect(model.readPhoto).toHaveBeenCalledWith(id);
      expect(controller.photo).toEqual(photo);
      expect(view.render).toHaveBeenCalledWith('openModal', {
        photo: photos[index],
        endpoint: api.ENDPOINT,
      });

      expect(model.readPhotos).toHaveBeenCalled();
      expect(controller.photos).toEqual(photos);
      expect(view.render).toHaveBeenCalledWith('loadingCompleted');
      expect(view.render).toHaveBeenCalledWith('photos', {
        photos,
        endpoint: api.ENDPOINT,
      });

      expect(controller.currentIndex).toBe(index);
      expect(view.setModalIndex).toHaveBeenCalledWith(index);
      expect(view.scrollMain).toHaveBeenCalledWith(index);
      expect(view.render).toHaveBeenCalledWith('modalMoveBtn', {
        prevPhoto: photos[index - 1],
        nextPhoto: photos[index + 1],
      });
      expect(view.render).toHaveBeenCalledWith('resizeModal', {
        photo: photos[index],
        index,
      });
    });

    it('path 지정: 존재하지 않는 경로', async () => {
      const id = 'something wrong id';
      await controller.setView(id);

      expect(model.readPhoto).toHaveBeenCalledWith(id);

      expect(Controller.redirectTo).toHaveBeenCalledWith('/');
    });
  });

  it('openModal', () => {
    controller.photos = photos;
    const index = 0;

    view.trigger('clickPhoto', index);

    expect(controller.currentIndex).toBe(index);
    expect(view.render).toHaveBeenCalledWith('openModal', {
      photo: photos[index],
      index,
      endpoint: api.ENDPOINT,
    });
    expect(view.render).toHaveBeenCalledWith('modalMoveBtn', {
      prevPhoto: photos[index - 1],
      nextPhoto: photos[index + 1],
    });
  });

  it('closeModal', () => {
    const index = 0;
    const photo = photos[index];
    controller.photo = photo;

    view.trigger('closeModal', index);

    expect(view.render).toHaveBeenCalledWith('closeInfo');
    expect(view.render).toHaveBeenCalledWith('cancelDelete');
    expect(view.render).toHaveBeenCalledWith('closeModal', {
      photo,
      index,
    });
  });

  describe('moveModal', () => {
    let index, photo;

    beforeEach(() => {
      index = 1;
      controller.photos = photos;
      photo = photos[index];
    });

    it('기본', () => {
      view.trigger('moveModal', index);

      expect(controller.currentIndex).toBe(index);
      expect(view.render).toHaveBeenCalledWith('moveModal', {
        photo,
        index,
        endpoint: api.ENDPOINT,
      });
      expect(view.render).toHaveBeenCalledWith('modalMoveBtn', {
        prevPhoto: photos[index - 1],
        nextPhoto: photos[index + 1],
      });
      expect(view.render).toHaveBeenCalledWith('cancelDelete');
    });

    it('정보 창이 열려있을 때', () => {
      controller.isInfoOpen = true;

      view.trigger('moveModal', index);

      expect(view.render).toHaveBeenCalledWith('openInfo', photo);
    });
  });

  it('toggleInfo', () => {
    const index = 0;
    const photo = photos[index];
    controller.photo = photo;
    const { isInfoOpen } = controller;

    view.trigger('clickInfoBtn', index);

    expect(view.render).toHaveBeenCalledWith('toggleInfo', photo);
    expect(controller.isInfoOpen).toBe(!isInfoOpen);
  });

  it('toggleDeleteConfirm', () => {
    view.trigger('clickDeleteBtn');

    expect(view.render).toHaveBeenCalledWith('toggleDeleteConfirm');
  });

  it('cancelDelete', () => {
    view.trigger('cancelDelete');

    expect(view.render).toHaveBeenCalledWith('cancelDelete');
  });

  it('uploadAndDelete', async () => {
    const image = await fetch(placeholder);
    const blob = await image.blob();

    const now = Date.now();
    const fileOptions = { type: 'image/png', lastModified: now };
    const file = new File([blob], `${now}.png`, fileOptions);

    await view.triggerAsync('upload', [file]);

    const photo = {
      _id: jasmine.any(String),
      filePath: `${now}/${now}.png`,
      dateTime: now,
      orientation: 1,
      pixelXDimension: 1,
      pixelYDimension: 1,
      width: 1,
      height: 1,
    };
    const nextPhotos = [photo, ...photos];

    expect(model.readPhotos).toHaveBeenCalled();
    expect(controller.photos).toEqual(nextPhotos);
    expect(view.render).toHaveBeenCalledWith('photos', {
      photos: nextPhotos,
      endpoint: api.ENDPOINT,
    });

    const index = 0;

    await view.triggerAsync('confirmDelete', index);

    expect(model.readPhotos).toHaveBeenCalled();
    expect(controller.photos).toEqual(photos);
    expect(view.render).toHaveBeenCalledWith('closeModal');
    expect(view.render).toHaveBeenCalledWith('photos', {
      photos,
      endpoint: api.ENDPOINT,
    });
  });
});
