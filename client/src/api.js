// const API_ENDPOINT = 'http://127.0.0.1:3000';
const API_ENDPOINT = 'https://alexander-photos-server.herokuapp.com';
export const IMG_PATH_PREFIX = 'https://alexander-photos-images.s3.ap-northeast-2.amazonaws.com';

export async function getImages() {
  try {
    const response = await fetch(`${API_ENDPOINT}/images`);
    if (!response.ok) throw new Error('fetch error');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function postImages(formData) {
  try {
    const response = await fetch(`${API_ENDPOINT}/images`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('fetch error');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}
