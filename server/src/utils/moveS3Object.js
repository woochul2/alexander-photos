const aws = require('aws-sdk');
const { IMG_BUCKET } = require('../constants');

/**
 * S3의 파일을 옮긴다.
 *
 * @param {string} filePath
 * @param {string} nextFilePath
 */
module.exports = async (filePath, nextFilePath) => {
  const s3 = new aws.S3();

  await s3
    .copyObject({
      CopySource: `${IMG_BUCKET}/${filePath}`,
      Bucket: IMG_BUCKET,
      Key: `${nextFilePath}`,
    })
    .promise();

  await s3
    .deleteObject({
      Bucket: IMG_BUCKET,
      Key: filePath,
    })
    .promise();
};
