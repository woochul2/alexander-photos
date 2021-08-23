const API_ENDPOINT = 'https://alexander-photos-server.herokuapp.com';

export async function requestImages() {
  try {
    const response = await fetch(`${API_ENDPOINT}/images`);
    if (!response.ok) throw new Error('fetch error');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}
