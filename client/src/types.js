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
 * @typedef {Object} ImageChild
 * @property {string} _id
 * @property {string} filePath
 *
 * @typedef {EXIF & ImageChild} Image
 */

/**
 * @typedef {Object} PhotoChild
 * @property {number} index
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Image & PhotoChild} Photo
 */
