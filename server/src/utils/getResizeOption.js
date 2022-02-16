const sharp = require('sharp');
const aws = require('aws-sdk');

/**
 * sharp에 사용할 resize 옵션을 구한다.
 *
 * @param {string} w
 * @param {string} h
 * @param {aws.S3.Body} s3ObjectBody
 */
module.exports = async (w, h, s3ObjectBody) => {
  const { width, height } = await sharp(s3ObjectBody).metadata();

  const minWidth = () => Math.min(parseInt(w, 10), width);
  const minHeight = () => Math.min(parseInt(h, 10), height);

  if (w && h) return { width: minWidth(), height: minHeight(), fit: 'fill' };
  if (w && !h) return { width: minWidth() };
  if (!w && h) return { height: minHeight() };
  return {};
};
