import getExifData from '../utils/getExifData';

export default class Model {
  /**
   * @param {import('../api').default} api
   */
  constructor(api) {
    this.api = api;
  }

  /**
   * 모든 사진의 정보를 가져온 후, 각 사진의 프로퍼티에 index와
   * 회전 여부에 따른 width, height를 추가하고 반환한다.
   */
  async readPhotos() {
    const images = await this.api.getImages();
    const photos = images.map((image, index) => {
      const { orientation, pixelXDimension: x, pixelYDimension: y } = image;
      const isRotated = orientation >= 5 && orientation <= 8;
      return isRotated
        ? { ...image, index, width: y, height: x }
        : { ...image, index, width: x, height: y };
    });

    return photos;
  }

  /**
   * 모든 사진을 업로드하고, 완료하면 true를 반환한다.
   *
   * @param {FileList} files
   */
  async upload(files) {
    const uploadFile = async (key) => {
      const formData = new FormData();
      const file = files[key];
      formData.append('photo', file);
      const exifData = await getExifData(file);
      formData.append('exifData', JSON.stringify(exifData));
      await this.api.postImage(formData);
    };

    const list = Object.keys(files).map((file) => uploadFile(file));
    await Promise.all(list);

    return true;
  }

  /**
   * 사진을 삭제하고, 완료하면 true를 반환한다.
   *
   * @param {string} filePath
   */
  async deletePhoto(filePath) {
    await this.api.deleteImage(filePath);
    return true;
  }
}
