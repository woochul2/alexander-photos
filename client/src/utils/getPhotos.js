import { getImages } from '../api.js';

export async function getPhotos() {
  const images = await getImages();
  const photos = images.results.map((image, index) => {
    return { ...image, index };
  });
  return photos;
}
