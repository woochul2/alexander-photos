import fetchData from './utils/fetchData';

export default class API {
  constructor() {
    // prettier-ignore
    // this.ENDPOINT = 'http://localhost:4000';
    this.ENDPOINT = 'https://4gpk31lzj8.execute-api.ap-northeast-2.amazonaws.com/dev';
  }

  /**
   * 서버에서 사진의 정보를 가져온다.
   *
   * @param {string} id
   * @returns {Promise<MyImage>}
   */
  async getImage(id) {
    const url = `${this.ENDPOINT}/api/image/${id}`;
    const data = await fetchData(url, { method: 'GET' });
    return data.result;
  }

  /**
   * 서버에서 모든 사진의 정보를 가져온다.
   *
   * @returns {Promise<MyImage[]>}
   */
  async getImages() {
    const url = `${this.ENDPOINT}/api/images`;
    const data = await fetchData(url, { method: 'GET' });
    return data.results;
  }

  /**
   * 서버에 사진을 업로드한다.
   *
   * @param {FormData} formData
   * @returns {Promise<{message:string, results: MyImage}>}
   */
  async postImage(formData) {
    const url = `${this.ENDPOINT}/api/image`;
    const data = await fetchData(url, {
      method: 'POST',
      body: formData,
    });
    return data;
  }

  /**
   * 서버의 사진을 삭제한다.
   *
   * @param {string} filePath
   * @returns {Promise<{message:string}>}
   */
  async deleteImage(filePath) {
    const url = `${this.ENDPOINT}/api/image/${filePath}`;
    const data = await fetchData(url, {
      method: 'DELETE',
    });
    return data;
  }
}
