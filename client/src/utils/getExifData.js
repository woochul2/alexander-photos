export function getExifData(file) {
  return new Promise((resolve, _reject) => {
    EXIF.getData(file, function () {
      const data = {
        dateTime: EXIF.getTag(this, 'DateTime'),
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
