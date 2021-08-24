// const API_ENDPOINT = 'http://127.0.0.1:3000';
const API_ENDPOINT = 'https://alexander-photos-server.herokuapp.com';

export async function getImages() {
  try {
    const response = await fetch(`${API_ENDPOINT}/images`);
    if (!response.ok) throw new Error('fetch error');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function postImages(files) {
  try {
    const response = await fetch(`${API_ENDPOINT}/images`, {
      method: 'POST',
      body: files,
    });
    if (!response.ok) throw new Error('fetch error');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}
