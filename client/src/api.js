// export const API_ENDPOINT = 'http://127.0.0.1:3000';
export const API_ENDPOINT = 'https://4gpk31lzj8.execute-api.ap-northeast-2.amazonaws.com/dev';

export async function getImages() {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/images`);
    if (!response.ok) throw new Error('fetch error');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function postImages(formData) {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/images`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('fetch error');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}
