/**
 * @typedef {Object} EXIF
 * @property {number} dateTime
 * @property {string | undefined} make
 * @property {string | undefined} model
 * @property {number} orientation
 * @property {number} pixelXDimension
 * @property {number} pixelYDimension
 */

/**
 * @typedef {Object} MyImageChild
 * @property {string} _id
 * @property {string} filePath
 *
 * @typedef {EXIF & MyImageChild} MyImage
 */

/**
 * @typedef {Object} PhotoChild
 * @property {number} width
 * @property {number} height
 *
 * @typedef {MyImage & PhotoChild} Photo
 */
