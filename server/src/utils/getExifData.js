const sharp = require('sharp');

/**
 * exifData 문자열을 받아 오브젝트로 바꾸고, 기본 값을 설정하여 반환한다.
 *
 * @param {string} exifDataString
 * @param {string} filePath
 * @return {Promise<MyImage>}
 */
module.exports = async (exifDataString, filePath) => {
  const exifData = { ...JSON.parse(exifDataString || null) };
  if (!exifData.dateTime) exifData.dateTime = new Date().getTime();
  if (!exifData.orientation) exifData.orientation = 1;
  if (!exifData.pixelXDimension || !exifData.pixelYDimension) {
    const { width, height } = await sharp(filePath).metadata();
    exifData.pixelXDimension = width;
    exifData.pixelYDimension = height;
  }
  return exifData;
};
