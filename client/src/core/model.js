import getExifData from '../utils/getExifData';

export default class Model {
  /**
   * @param {import('../api').default} api
   */
  constructor(api) {
    this.api = api;
  }

  /**
   * 사진의 프로퍼티에 회전 여부에 따른 width, height를 추가하고 반환한다.
   *
   * @param {MyImage} image
   * @returns
   */
  static imageToPhoto(image) {
    const { orientation, pixelXDimension: x, pixelYDimension: y } = image;
    const isRotated = orientation >= 5 && orientation <= 8;
    return isRotated
      ? { ...image, width: y, height: x }
      : { ...image, width: x, height: y };
  }

  /**
   * 사진의 정보를 가져온 후 가공하여 반환한다.
   *
   * @param {string} id
   */
  async readPhoto(id) {
    const image = await this.api.getImage(id);
    const photo = Model.imageToPhoto(image);
    return photo;
  }

  /**
   * 모든 사진의 정보를 가져온 후 가공하여 반환한다.
   */
  async readPhotos() {
    const images = await this.api.getImages();
    const photos = images.map(Model.imageToPhoto);
    return photos;
  }

  /**
   * 모든 사진을 업로드하고, 업로드하지 못한 파일 목록을 반환한다.
   *
   * @param {FileList} files
   * @param {function} callback 업로드 진행 정도를 출력하는 함수
   * @returns {Promise<string[]>}
   */
  async upload(files, callback) {
    const rejectedFiles = new Set();
    const fileList = [...files];
    fileList.forEach(({ name }) => {
      rejectedFiles.add(name);
    });

    let progressPercent = 0;

    const uploadFile = async (key) => {
      const formData = new FormData();
      const file = files[key];
      formData.append('photo', file);
      const exifData = await getExifData(file);
      formData.append('exifData', JSON.stringify(exifData));
      progressPercent += 100 / fileList.length;
      callback(progressPercent);
      await this.api.postImage(formData);
      rejectedFiles.delete(file.name);
    };

    const list = Object.keys(files).map((file) => uploadFile(file));
    await Promise.allSettled(list);
    callback(0);
    return [...rejectedFiles];
  }

  /**
   * 사진을 삭제한다.
   *
   * @param {string} filePath
   */
  async deletePhoto(filePath) {
    await this.api.deleteImage(filePath);
  }
}
