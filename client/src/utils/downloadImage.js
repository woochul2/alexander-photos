/**
 * 사진 URL을 받아 해당 사진을 다운로드한다.
 *
 * @param {string} url
 * @param {string} fileName
 */
export default async (url, fileName) => {
  const imagePath = encodeURI(url);
  const image = await fetch(imagePath);
  const imageBlob = await image.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(imageBlob);
  a.download = fileName;
  a.click();
};
