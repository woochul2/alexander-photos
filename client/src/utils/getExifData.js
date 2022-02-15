import { getData, getTag } from 'exif-js';

/**
 * 2021:09:24 18:42:00와 같은 형식으로 작성된 dateTime 값을
 * timestamp 형식으로 바꾼다.
 *
 * @param {string} dateTime ex) '2021:09:24 18:42:00'
 * @param {File} file
 * @returns
 */
const getTimeStamp = (dateTime, file) => {
  if (!dateTime) return file.lastModified;

  const [year, month, date, hours, minutes, seconds] = dateTime
    .split(' ')
    .flatMap((str) => str.split(':'))
    .map((str) => Number(str));

  return new Date(year, month - 1, date, hours, minutes, seconds).getTime();
};

/**
 * 사진 파일의 EXIF 값을 반환한다.
 *
 * @param {File} file
 * @returns {Promise<EXIF>}
 */
export default (file) => {
  return new Promise((resolve, _reject) => {
    getData(file, function () {
      const data = {
        dateTime: getTimeStamp(getTag(this, 'DateTime'), file),
        make: getTag(this, 'Make'),
        model: getTag(this, 'Model'),
        orientation: getTag(this, 'Orientation'),
        pixelXDimension: getTag(this, 'PixelXDimension'),
        pixelYDimension: getTag(this, 'PixelYDimension'),
      };
      resolve(data);
    });
  });
};
