function getTimeStamp(dateTime, file) {
  if (!dateTime) {
    if (!file.lastModifiedDate) return;
    return file.lastModifiedDate.getTime();
  }

  // dateTime example) 2021:09:24 18:42:00
  const [year, month, date, hours, minutes, seconds] = dateTime
    .split(' ')
    .map((str) => str.split(':'))
    .flat()
    .map((str) => Number(str));

  return new Date(year, month - 1, date, hours, minutes, seconds).getTime();
}

export function getExifData(file) {
  return new Promise((resolve, _reject) => {
    EXIF.getData(file, function () {
      const data = {
        dateTime: getTimeStamp(EXIF.getTag(this, 'DateTime'), file),
        make: EXIF.getTag(this, 'Make'),
        model: EXIF.getTag(this, 'Model'),
        orientation: EXIF.getTag(this, 'Orientation'),
        pixelXDimension: EXIF.getTag(this, 'PixelXDimension'),
        pixelYDimension: EXIF.getTag(this, 'PixelYDimension'),
      };
      resolve(data);
    });
  });
}
